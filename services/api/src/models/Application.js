const { getConnection } = require('../db/connection');

// In-memory storage for applications as fallback
const applicationStorage = new Map();

class ApplicationModel {
  // Create new application with details
  static async createApplication(applicationData) {
    const {
      applicationToken,
      firstName,
      lastName,
      email,
      phoneNumber,
      ssn,
      dateOfBirth,
      requestedAmount,
      flowType,
      projectDetails,
      financialDetails,
      sameAsApplicantAddress,
    } = applicationData;

    const applicationId = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const detailsId = `APPDET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      const pool = await getConnection();
      const request = pool.request();

      // Extract address fields
      const addressLine1 = projectDetails?.projectAddressLine || null;
      const city1 = projectDetails?.projectCity || null;
      const state1 = projectDetails?.projectState || null;
      const zip1 = projectDetails?.projectZipCode || null;
      const addressLine2 = projectDetails?.applicantAddressLine || null;
      const city2 = projectDetails?.applicantCity || null;
      const state2 = projectDetails?.applicantState || null;
      const zip2 = projectDetails?.applicantZipCode || null;

      await request
        .input('id', null, applicationId)
        .input('applicationToken', null, applicationToken)
        .input('customerName', null, `${firstName} ${lastName}`)
        .input('customerEmail', null, email)
        .input('loanAmount', null, parseFloat(requestedAmount) || 0)
        .input('flowType', null, flowType)
        .input('status', null, 'pending')
        .input('subStatus', null, 'pending with lender')
        .input('projectAddressLine', null, addressLine1)
        .input('projectCity', null, city1)
        .input('projectState', null, state1)
        .input('projectZipCode', null, zip1)
        .input('applicantAddressLine', null, addressLine2)
        .input('applicantCity', null, city2)
        .input('applicantState', null, state2)
        .input('applicantZipCode', null, zip2)
        .input('sameAsApplicantAddress', null, sameAsApplicantAddress ? 1 : 0);

      try {
        await request.query(`
          INSERT INTO applications 
          (id, application_token, customer_name, customer_email, loan_amount, flow_type, status, sub_status,
           project_address_line, project_city, project_state, project_zip_code,
           applicant_address_line, applicant_city, applicant_state, applicant_zip_code, same_as_applicant_address)
          VALUES (@id, @applicationToken, @customerName, @customerEmail, @loanAmount, @flowType, @status, @subStatus,
                  @projectAddressLine, @projectCity, @projectState, @projectZipCode,
                  @applicantAddressLine, @applicantCity, @applicantState, @applicantZipCode, @sameAsApplicantAddress)
        `);
      } catch (insertErr) {
        // sub_status column may not exist yet — insert without it
        const requestFallback = pool.request();
        await requestFallback
          .input('id', null, applicationId)
          .input('applicationToken', null, applicationToken)
          .input('customerName', null, `${firstName} ${lastName}`)
          .input('customerEmail', null, email)
          .input('loanAmount', null, parseFloat(requestedAmount) || 0)
          .input('flowType', null, flowType)
          .input('status', null, 'pending')
          .input('projectAddressLine', null, addressLine1)
          .input('projectCity', null, city1)
          .input('projectState', null, state1)
          .input('projectZipCode', null, zip1)
          .input('applicantAddressLine', null, addressLine2)
          .input('applicantCity', null, city2)
          .input('applicantState', null, state2)
          .input('applicantZipCode', null, zip2)
          .input('sameAsApplicantAddress', null, sameAsApplicantAddress ? 1 : 0)
          .query(`
            INSERT INTO applications 
            (id, application_token, customer_name, customer_email, loan_amount, flow_type, status,
             project_address_line, project_city, project_state, project_zip_code,
             applicant_address_line, applicant_city, applicant_state, applicant_zip_code, same_as_applicant_address)
            VALUES (@id, @applicationToken, @customerName, @customerEmail, @loanAmount, @flowType, @status,
                    @projectAddressLine, @projectCity, @projectState, @projectZipCode,
                    @applicantAddressLine, @applicantCity, @applicantState, @applicantZipCode, @sameAsApplicantAddress)
          `);
      }

      // Insert into application_details table
      const request2 = pool.request();
      await request2
        .input('id', null, detailsId)
        .input('applicationId', null, applicationId)
        .input('firstName', null, firstName)
        .input('lastName', null, lastName)
        .input('phoneNumber', null, phoneNumber)
        .input('email', null, email)
        .input('ssn', null, ssn)
        .input('dateOfBirth', null, dateOfBirth)
        .input('requestedAmount', null, parseFloat(requestedAmount) || 0)
        .query(`
          INSERT INTO application_details
          (id, application_id, first_name, last_name, phone_number, email, ssn, date_of_birth, requested_amount)
          VALUES (@id, @applicationId, @firstName, @lastName, @phoneNumber, @email, @ssn, @dateOfBirth, @requestedAmount)
        `);

      console.log(`[APP] Saved application details ${detailsId} for application ${applicationId}`);

      // Insert project details if contractor-led flow
      if (flowType === 'contractor-led' && projectDetails) {
        const projectId = `PROJ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const sameAsApplicantAddressValue = sameAsApplicantAddress ? 1 : 0;
        console.log(`[APP] Saving project_details for contractor-led: sameAsApplicantAddress = ${sameAsApplicantAddressValue} (input value: ${sameAsApplicantAddress})`);
        const request3 = pool.request();
        await request3
          .input('id', null, projectId)
          .input('applicationId', null, applicationId)
          .input('expectedFinancingAmount', null, parseFloat(projectDetails.expectedFinancingAmount) || 0)
          .input('projectType', null, projectDetails.projectType)
          .input('sameAsApplicantAddress', null, sameAsApplicantAddressValue)
          .query(`
            INSERT INTO project_details
            (id, application_id, expected_financing_amount, project_type, same_as_applicant_address)
            VALUES (@id, @applicationId, @expectedFinancingAmount, @projectType, @sameAsApplicantAddress)
          `);
        console.log(`[APP] Saved project_details ${projectId} with same_as_applicant_address = ${sameAsApplicantAddressValue}`);
      }

      // Insert financial details if contractor-led flow
      if (flowType === 'contractor-led' && financialDetails) {
        const financialId = `FIN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const request4 = pool.request();
        await request4
          .input('id', null, financialId)
          .input('applicationId', null, applicationId)
          .input('annualIncome', null, parseFloat(financialDetails.annualIncome) || 0)
          .input('monthlyIncome', null, parseFloat(financialDetails.monthlyIncome) || 0)
          .input('hasSpecialIncome', null, financialDetails.hasSpecialIncome ? 1 : 0)
          .query(`
            INSERT INTO financial_details
            (id, application_id, annual_income, monthly_income, has_special_income)
            VALUES (@id, @applicationId, @annualIncome, @monthlyIncome, @hasSpecialIncome)
          `);
      }

      console.log(`[APP] Created application ${applicationId} in database`);
      console.log(`[APP] same_as_applicant_address saved to applications table: ${sameAsApplicantAddress ? 1 : 0}`);

      // Also store in memory for quick retrieval
      applicationStorage.set(applicationToken, {
        id: applicationId,
        applicationToken,
        flowType,
        status: 'pending',
        subStatus: 'pending with lender',
        basicDetails: {
          firstName,
          lastName,
          email,
          phoneNumber,
          ssn,
          dateOfBirth,
          requestedAmount,
        },
        projectDetails: projectDetails || null,
        financialDetails: financialDetails || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        id: applicationId,
        applicationToken,
        flowType,
        status: 'pending',
        subStatus: 'pending with lender',
        basicDetails: {
          firstName,
          lastName,
          email,
          phoneNumber,
          ssn,
          dateOfBirth,
          requestedAmount,
        },
        createdAt: new Date(),
        savedToDatabase: true,
      };
    } catch (dbError) {
      console.warn(`[APP] Database save failed: ${dbError.message}`);
      console.warn(`[APP] Falling back to in-memory storage for application ${applicationToken}`);

      // Fallback to in-memory storage
      const fallbackId = `APP-${Date.now()}`;
      applicationStorage.set(applicationToken, {
        id: fallbackId,
        applicationToken,
        flowType,
        status: 'pending',
        subStatus: 'pending with lender',
        basicDetails: {
          firstName,
          lastName,
          email,
          phoneNumber,
          ssn,
          dateOfBirth,
          requestedAmount,
        },
        projectDetails: projectDetails || null,
        financialDetails: financialDetails || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        id: fallbackId,
        applicationToken,
        flowType,
        status: 'pending',
        subStatus: 'pending with lender',
        basicDetails: {
          firstName,
          lastName,
          email,
          phoneNumber,
          ssn,
          dateOfBirth,
          requestedAmount,
        },
        createdAt: new Date(),
        savedToDatabase: false,
        error: dbError.message,
      };
    }
  }

  // Get application by token
  static async getApplicationByToken(token) {
    try {
      try {
        const pool = await getConnection();
        const request = pool.request();
        // Look up by application_token first (customer flow), then by id (lender/merchant view details)
        let result;
        try {
          result = await request
            .input('token', null, token)
            .query(`
              SELECT id, application_token, customer_name, customer_email, loan_amount, 
                     flow_type, status, sub_status, phone_verified, ssn_verified, 
                     project_address_line, project_city, project_state, project_zip_code,
                     applicant_address_line, applicant_city, applicant_state, applicant_zip_code,
                     created_at, updated_at
              FROM applications 
              WHERE application_token = @token OR id = @token
            `);
        } catch (colErr) {
          // sub_status column may not exist yet — retry without it
          const request2b = pool.request();
          result = await request2b
            .input('token', null, token)
            .query(`
              SELECT id, application_token, customer_name, customer_email, loan_amount, 
                     flow_type, status, phone_verified, ssn_verified, 
                     project_address_line, project_city, project_state, project_zip_code,
                     applicant_address_line, applicant_city, applicant_state, applicant_zip_code,
                     created_at, updated_at
              FROM applications 
              WHERE application_token = @token OR id = @token
            `);
        }

        if (result.recordset && result.recordset.length > 0) {
          const app = result.recordset[0];

          // Get application details
          const request2 = pool.request();
          const detailsResult = await request2
            .input('applicationId', null, app.id)
            .query(`
              SELECT * FROM application_details 
              WHERE application_id = @applicationId
            `);

          const details = detailsResult.recordset[0] || {};

          // Fallback: derive names from customer_name if application_details is missing
          const customerNameParts = (app.customer_name || '').split(' ');
          const fallbackFirst = customerNameParts[0] || '';
          const fallbackLast = customerNameParts.slice(1).join(' ') || '';

          // Get project details
          const request3 = pool.request();
          const projectResult = await request3
            .input('applicationId', null, app.id)
            .query(`
              SELECT * FROM project_details 
              WHERE application_id = @applicationId
            `);

          const project = projectResult.recordset[0] || null;

          // Get financial details
          const request4 = pool.request();
          const financialResult = await request4
            .input('applicationId', null, app.id)
            .query(`
              SELECT * FROM financial_details 
              WHERE application_id = @applicationId
            `);

          const financial = financialResult.recordset[0] || null;

          console.log(`[APP] Retrieved application ${app.id} from database`);

          return {
            id: app.id,
            applicationToken: app.application_token,
            flowType: app.flow_type,
            status: app.status,
            subStatus: app.sub_status || 'pending with lender',
            phoneVerified: app.phone_verified == 1 || app.phone_verified === true,
            ssnVerified: app.ssn_verified == 1 || app.ssn_verified === true,
            projectAddress: {
              addressLine: app.project_address_line,
              city: app.project_city,
              state: app.project_state,
              zipCode: app.project_zip_code,
            },
            applicantAddress: {
              addressLine: app.applicant_address_line,
              city: app.applicant_city,
              state: app.applicant_state,
              zipCode: app.applicant_zip_code,
            },
            basicDetails: {
              firstName: details.first_name || fallbackFirst,
              lastName: details.last_name || fallbackLast,
              email: details.email || app.customer_email,
              phoneNumber: details.phone_number || null,
              ssn: details.ssn || null,
              dateOfBirth: details.date_of_birth || null,
              requestedAmount: details.requested_amount || app.loan_amount,
            },
            projectDetails: project ? {
              expectedFinancingAmount: project.expected_financing_amount,
              projectType: project.project_type,
              projectAddress: project.project_address,
              sameAsApplicantAddress: project.same_as_applicant_address == 1 || project.same_as_applicant_address === true,
              applicantAddress: project.applicant_address,
            } : null,
            financialDetails: financial ? {
              annualIncome: financial.annual_income,
              monthlyIncome: financial.monthly_income,
              hasSpecialIncome: financial.has_special_income == 1 || financial.has_special_income === true,
            } : null,
            createdAt: app.created_at,
            updatedAt: app.updated_at,
          };
        }
      } catch (dbError) {
        console.warn(`[APP] Database query failed: ${dbError.message}`);
      }

      // Fallback to in-memory storage - check by token key first, then scan by id
      let app = applicationStorage.get(token);
      if (!app) {
        // token param might be an app id, scan in-memory storage
        for (const stored of applicationStorage.values()) {
          if (stored.id === token) {
            app = stored;
            break;
          }
        }
      }
      if (app) {
        console.log(`[APP] Retrieved application from in-memory storage`);
        return app;
      }

      return null;
    } catch (error) {
      console.error(`[APP] Error retrieving application: ${error.message}`);
      throw error;
    }
  }

  // Get all applications
  static async getAllApplications() {
    try {
      try {
        const pool = await getConnection();
        const request = pool.request();
        let allResult;
        try {
          allResult = await request.query(`
            SELECT id, application_token, customer_name, customer_email, loan_amount, 
                   flow_type, status, sub_status, phone_verified, ssn_verified, 
                   project_address_line, project_city, project_state, project_zip_code,
                   applicant_address_line, applicant_city, applicant_state, applicant_zip_code,
                   created_at, updated_at
            FROM applications 
            WHERE status != 'draft'
            ORDER BY created_at DESC
          `);
        } catch (colErr) {
          const request2b = pool.request();
          allResult = await request2b.query(`
            SELECT id, application_token, customer_name, customer_email, loan_amount, 
                   flow_type, status, phone_verified, ssn_verified, 
                   project_address_line, project_city, project_state, project_zip_code,
                   applicant_address_line, applicant_city, applicant_state, applicant_zip_code,
                   created_at, updated_at
            FROM applications 
            WHERE status != 'draft'
            ORDER BY created_at DESC
          `);
        }
        const result = allResult;

        if (result.recordset && result.recordset.length > 0) {
          console.log(`[APP] Retrieved ${result.recordset.length} applications from database`);
          return result.recordset.map(app => ({
            id: app.id,
            applicationToken: app.application_token,
            customerName: app.customer_name,
            customerEmail: app.customer_email,
            loanAmount: app.loan_amount,
            flowType: app.flow_type,
            status: app.status,
            subStatus: app.sub_status || 'pending with lender',
            phoneVerified: app.phone_verified == 1 || app.phone_verified === true,
            ssnVerified: app.ssn_verified == 1 || app.ssn_verified === true,
            projectAddress: {
              addressLine: app.project_address_line,
              city: app.project_city,
              state: app.project_state,
              zipCode: app.project_zip_code,
            },
            applicantAddress: {
              addressLine: app.applicant_address_line,
              city: app.applicant_city,
              state: app.applicant_state,
              zipCode: app.applicant_zip_code,
            },
            createdAt: app.created_at,
            updatedAt: app.updated_at,
          }));
        }
      } catch (dbError) {
        console.warn(`[APP] Database query failed: ${dbError.message}`);
      }

      // Fallback to in-memory storage
      const appList = Array.from(applicationStorage.values())
        .filter(app => app.status !== 'draft')
        .map(app => ({
          id: app.id,
          applicationToken: app.applicationToken,
          customerName: `${app.basicDetails.firstName} ${app.basicDetails.lastName}`,
          customerEmail: app.basicDetails.email,
          loanAmount: app.basicDetails.requestedAmount,
          flowType: app.flowType,
          status: app.status,
          phoneVerified: app.phoneVerified || false,
          ssnVerified: app.ssnVerified || false,
          projectAddress: {
            addressLine: app.projectDetails?.projectAddressLine || null,
            city: app.projectDetails?.projectCity || null,
            state: app.projectDetails?.projectState || null,
            zipCode: app.projectDetails?.projectZipCode || null,
          },
          applicantAddress: {
            addressLine: app.projectDetails?.applicantAddressLine || null,
            city: app.projectDetails?.applicantCity || null,
            state: app.projectDetails?.applicantState || null,
            zipCode: app.projectDetails?.applicantZipCode || null,
          },
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
        }));

      console.log(`[APP] Retrieved ${appList.length} applications from in-memory storage`);
      return appList;
    } catch (error) {
      console.error(`[APP] Error retrieving applications: ${error.message}`);
      throw error;
    }
  }

  // Update application status
  static async updateApplicationStatus(applicationId, status) {
    try {
      const pool = await getConnection();
      const request = pool.request();
      await request
        .input('id', null, applicationId)
        .input('status', null, status)
        .query(`
          UPDATE applications 
          SET status = @status, updated_at = CURRENT_TIMESTAMP
          WHERE id = @id
        `);

      console.log(`[APP] Updated application ${applicationId} status to ${status}`);
      return true;
    } catch (error) {
      console.warn(`[APP] Failed to update application status: ${error.message}`);
      return false;
    }
  }

  // Update verification flags
  static async updateVerificationFlags(applicationId, phoneVerified, ssnVerified) {
    try {
      const pool = await getConnection();
      const request = pool.request();
      await request
        .input('id', null, applicationId)
        .input('phoneVerified', null, phoneVerified ? 1 : 0)
        .input('ssnVerified', null, ssnVerified ? 1 : 0)
        .query(`
          UPDATE applications 
          SET phone_verified = @phoneVerified, ssn_verified = @ssnVerified, updated_at = CURRENT_TIMESTAMP
          WHERE id = @id
        `);

      console.log(`[APP] Updated application ${applicationId} verification flags`);
      return true;
    } catch (error) {
      console.warn(`[APP] Failed to update verification flags: ${error.message}`);
      return false;
    }
  }

  // Submit customer-led application with address and financial details
  static async submitCustomerApplication(applicationId, propertyAddress, applicantAddress, financialDetails, sameAsPropertyAddress) {
    try {
      const pool = await getConnection();
      const request = pool.request();

      // Update applications table with address fields
      await request
        .input('id', null, applicationId)
        .input('projectAddressLine', null, propertyAddress?.streetAddress || null)
        .input('projectCity', null, propertyAddress?.city || null)
        .input('projectState', null, propertyAddress?.state || null)
        .input('projectZipCode', null, propertyAddress?.zipCode || null)
        .input('applicantAddressLine', null, applicantAddress?.streetAddress || null)
        .input('applicantCity', null, applicantAddress?.city || null)
        .input('applicantState', null, applicantAddress?.state || null)
        .input('applicantZipCode', null, applicantAddress?.zipCode || null)
        .input('status', null, 'submitted')
        .input('sameAsApplicantAddress', null, sameAsPropertyAddress ? 1 : 0)
        .query(`
          UPDATE applications 
          SET project_address_line = @projectAddressLine,
              project_city = @projectCity,
              project_state = @projectState,
              project_zip_code = @projectZipCode,
              applicant_address_line = @applicantAddressLine,
              applicant_city = @applicantCity,
              applicant_state = @applicantState,
              applicant_zip_code = @applicantZipCode,
              same_as_applicant_address = @sameAsApplicantAddress,
              status = @status,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = @id
        `);

      console.log(`[APP] Updated application ${applicationId} with address fields`);
      console.log(`[APP] same_as_applicant_address updated in applications table: ${sameAsPropertyAddress ? 1 : 0}`);

      // Save project details with same_as_applicant_address flag
      const projectId = `PROJ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const sameAsApplicantAddressValue = sameAsPropertyAddress ? 1 : 0;
      console.log(`[APP] Saving project_details for customer-led: sameAsApplicantAddress = ${sameAsApplicantAddressValue} (input value: ${sameAsPropertyAddress})`);
      const request_proj = pool.request();
      await request_proj
        .input('id', null, projectId)
        .input('applicationId', null, applicationId)
        .input('sameAsApplicantAddress', null, sameAsApplicantAddressValue)
        .query(`
          INSERT INTO project_details
          (id, application_id, same_as_applicant_address)
          VALUES (@id, @applicationId, @sameAsApplicantAddress)
        `);

      console.log(`[APP] Saved project details ${projectId} with same_as_applicant_address = ${sameAsApplicantAddressValue}`);

      // Save financial details if provided
      if (financialDetails && financialDetails.annualIncome) {
        const financialId = `FIN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const request2 = pool.request();
        await request2
          .input('id', null, financialId)
          .input('applicationId', null, applicationId)
          .input('annualIncome', null, parseFloat(financialDetails.annualIncome) || 0)
          .input('monthlyIncome', null, parseFloat(financialDetails.annualIncome) / 12 || 0)
          .input('hasSpecialIncome', null, 0)
          .query(`
            INSERT INTO financial_details
            (id, application_id, annual_income, monthly_income, has_special_income)
            VALUES (@id, @applicationId, @annualIncome, @monthlyIncome, @hasSpecialIncome)
          `);

        console.log(`[APP] Saved financial details for application ${applicationId}`);
      }

      return true;
    } catch (error) {
      console.warn(`[APP] Failed to submit customer application: ${error.message}`);
      return false;
    }
  }
}

module.exports = ApplicationModel;
