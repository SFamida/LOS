const express = require('express');
const router = express.Router();
const ApplicationModel = require('../models/Application');
const { sendCustomerApplicationLink } = require('../utils/emailService');

// Mock data storage for OTP
const otpStorage = new Map(); // key: token, value: { otp, expiresAt, phoneNumber }

// Generate unique token
const generateToken = () => `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Generate OTP (6 digits) - Fixed to 123456 for testing
const generateOTP = () => 123456;

// Get all applications (for lender platform)
router.get('/', async (req, res) => {
  try {
    const appList = await ApplicationModel.getAllApplications();
    res.json({
      success: true,
      data: appList,
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications: ' + error.message,
    });
  }
});

// Create application (merchant initiates)
router.post('/', async (req, res) => {
  const { basicDetails, projectDetails, financialDetails, flowType } = req.body;
  const sameAsApplicantAddress = projectDetails?.sameAsApplicantAddress || false;
  console.log(`[ROUTE] POST /applications: flowType=${flowType}, sameAsApplicantAddress=${sameAsApplicantAddress}, projectDetails.sameAsApplicantAddress=${projectDetails?.sameAsApplicantAddress}`);

  // Validation
  if (!basicDetails || !flowType) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields',
    });
  }

  if (!basicDetails.firstName || !basicDetails.lastName || !basicDetails.email ||
      !basicDetails.phoneNumber || !basicDetails.ssn || !basicDetails.dateOfBirth ||
      !basicDetails.requestedAmount) {
    return res.status(400).json({
      success: false,
      message: 'Missing required basic details',
    });
  }

  // Validate contractor-led specific fields
  if (flowType === 'contractor-led') {
    if (!projectDetails || !financialDetails) {
      return res.status(400).json({
        success: false,
        message: 'Missing required project or financial details for contractor-led flow',
      });
    }
  }

  try {
    const applicationToken = generateToken();

    // Create application in database
    const applicationData = {
      applicationToken,
      firstName: basicDetails.firstName,
      lastName: basicDetails.lastName,
      email: basicDetails.email,
      phoneNumber: basicDetails.phoneNumber,
      ssn: basicDetails.ssn,
      dateOfBirth: basicDetails.dateOfBirth,
      requestedAmount: basicDetails.requestedAmount,
      flowType,
      projectDetails: projectDetails || null,
      financialDetails: financialDetails || null,
      sameAsApplicantAddress: sameAsApplicantAddress,
    };

    const newApplication = await ApplicationModel.createApplication(applicationData);

    // Generate application link for customer-led flow
    const applicationLink = flowType === 'customer-led' 
      ? `${process.env.MERCHANT_PLATFORM_URL || 'http://localhost:3000'}/apply/${applicationToken}`
      : null;

    // Send email notification for customer-led flow
    let emailResult = null;
    if (flowType === 'customer-led' && applicationLink) {
      const customerName = `${basicDetails.firstName} ${basicDetails.lastName}`;
      emailResult = await sendCustomerApplicationLink(
        basicDetails.email,
        customerName,
        applicationLink
      );
      console.log(`[APP] Email result for customer-led application: ${emailResult.mode}`);
    }

    res.status(201).json({
      success: true,
      data: newApplication,
      message: 'Application created successfully',
      applicationLink: applicationLink,
      emailNotification: emailResult ? {
        sent: emailResult.success === true,
        mode: emailResult.mode,
        previewUrl: emailResult.previewUrl || null,
      } : null,
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create application: ' + error.message,
    });
  }
});

// Get application by token (for customer to continue application)
router.get('/:token', async (req, res) => {
  const { token } = req.params;
  
  try {
    const app = await ApplicationModel.getApplicationByToken(token);

    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.json({
      success: true,
      data: app,
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application: ' + error.message,
    });
  }
});

// Request OTP for phone verification
router.post('/:token/request-otp', async (req, res) => {
  const { token } = req.params;
  const { phoneNumber } = req.body;

  try {
    const app = await ApplicationModel.getApplicationByToken(token);
    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStorage.set(token, {
      otp,
      expiresAt,
      phoneNumber,
      attempts: 0,
    });

    // In development, log the OTP
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent to your phone',
      // Remove this in production - only for testing
      ...(process.env.NODE_ENV === 'development' && { otp }),
    });
  } catch (error) {
    console.error('Error requesting OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request OTP: ' + error.message,
    });
  }
});

// Verify OTP
router.post('/:token/verify-otp', async (req, res) => {
  const { token } = req.params;
  const { otp } = req.body;

  try {
    const app = await ApplicationModel.getApplicationByToken(token);
    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const otpData = otpStorage.get(token);
    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: 'No OTP request found. Please request an OTP first.',
      });
    }

    // Check if OTP expired
    if (Date.now() > otpData.expiresAt) {
      otpStorage.delete(token);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
      });
    }

    // Check OTP attempts
    if (otpData.attempts >= 3) {
      otpStorage.delete(token);
      return res.status(400).json({
        success: false,
        message: 'Too many OTP attempts. Please request a new one.',
      });
    }

    // Verify OTP
    if (String(otp) !== String(otpData.otp)) {
      otpData.attempts += 1;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining.`,
      });
    }

    // OTP verified - update database
    await ApplicationModel.updateVerificationFlags(app.id, true, false);
    otpStorage.delete(token);

    // Fetch updated application
    const updatedApp = await ApplicationModel.getApplicationByToken(token);

    res.json({
      success: true,
      message: 'Phone number verified successfully',
      data: updatedApp,
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP: ' + error.message,
    });
  }
});

// Verify SSN
router.post('/:token/verify-ssn', async (req, res) => {
  const { token } = req.params;
  const { ssn } = req.body;

  try {
    const app = await ApplicationModel.getApplicationByToken(token);
    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (!ssn) {
      return res.status(400).json({
        success: false,
        message: 'SSN is required',
      });
    }

    // Validate SSN format: should be 9 digits (can have dashes like XXX-XX-XXXX)
    const ssnDigits = ssn.replace(/\D/g, '');
    if (ssnDigits.length !== 9) {
      return res.status(400).json({
        success: false,
        message: 'SSN must be 9 digits',
      });
    }

    // SSN verified - update database
    await ApplicationModel.updateVerificationFlags(app.id, true, true);

    // Fetch updated application
    const updatedApp = await ApplicationModel.getApplicationByToken(token);

    res.json({
      success: true,
      message: 'SSN verified successfully',
      data: updatedApp,
    });
  } catch (error) {
    console.error('Error verifying SSN:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify SSN: ' + error.message,
    });
  }
});

// Submit complete application
router.post('/:token/submit', async (req, res) => {
  const { token } = req.params;
  const {
    personalInformation,
    propertyAddress,
    applicantAddress,
    sameAsPropertyAddress,
    financialDetails,
  } = req.body;

  console.log(`[ROUTE] POST /:token/submit: sameAsPropertyAddress=${sameAsPropertyAddress}`);

  try {
    const app = await ApplicationModel.getApplicationByToken(token);
    if (!app) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Verify all required steps are completed
    if (!app.phoneVerified || !app.ssnVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all verification steps first',
      });
    }

    if (!personalInformation || !propertyAddress || !financialDetails) {
      return res.status(400).json({
        success: false,
        message: 'Missing required information',
      });
    }

    // Submit application with address and financial details
    const submitted = await ApplicationModel.submitCustomerApplication(
      app.id,
      propertyAddress,
      applicantAddress,
      financialDetails,
      sameAsPropertyAddress
    );

    if (!submitted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to submit application',
      });
    }

    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        id: app.id,
        status: 'submitted',
      },
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application: ' + error.message,
    });
  }
});

// Update application status (for lender platform)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const updated = await ApplicationModel.updateApplicationStatus(id, status);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or update failed',
      });
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: { id, status },
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status: ' + error.message,
    });
  }
});

module.exports = router;
