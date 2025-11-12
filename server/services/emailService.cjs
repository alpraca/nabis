const nodemailer = require('nodemailer');

// Create a transporter using environment variables. Supports custom SMTP host/port/secure or defaults to Gmail.
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('⚠️  EMAIL_USER or EMAIL_PASS not set - SMTP disabled');
    return null;
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false' }
  });

  return transporter;
};

// Development fallback logging helper
const logEmailToConsole = (to, subject, html) => {
  console.log('\n📧 ===== EMAIL (console fallback) =====');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('HTML preview (truncated):', html ? html.slice(0, 400) + (html.length > 400 ? '... (truncated)' : '') : '(no body)');
  console.log('📧 ===================================\n');
};

// Send verification email with 6-digit code
const sendVerificationEmail = async (email, verificationCode, name) => {
  const transporter = createTransporter();
  
  const subject = 'Kodi i verifikimit - Nabis Farmaci';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Kodi i Verifikimit</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #ec4899; font-size: 32px; margin: 0;">
            Nabis <span style="color: #22c55e;">Farmaci</span>
          </h1>
          <p style="color: #6b7280; margin: 10px 0 0 0;">Farmacia juaj online e besuar</p>
        </div>
        
        <!-- Content -->
        <div style="text-align: center;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Mirë se erdhe, ${name}!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            Për të përfunduar regjistrimin tuaj në Nabis Farmaci, ju lutemi futni kodin e verifikimit më poshtë:
          </p>
          
          <!-- Verification Code -->
          <div style="background-color: #f3f4f6; padding: 30px; border-radius: 12px; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
              Kodi i Verifikimit
            </p>
            <div style="font-size: 36px; font-weight: bold; color: #1f2937; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${verificationCode}
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 30px;">
            Ky kod është i vlefshëm për 10 minuta. Nëse nuk e keni kërkuar këtë kod, mund ta injoroni këtë email.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 40px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
            © 2025 Nabis Farmaci. Të gjitha të drejtat të rezervuara.
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Ky email u dërgua automatikisht. Ju lutemi mos përgjigjuni në këtë adresë.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    logEmailToConsole(email, subject, html);
    return { success: false, error: 'SMTP_NOT_CONFIGURED' };
  }

  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const fromName = process.env.EMAIL_FROM_NAME || 'Nabis Farmaci';

  const mailOptions = {
    from: `${fromName} <${fromAddress}>`,
    // Optionally redirect all outgoing emails to a single test inbox (development)
    to: process.env.TEST_EMAIL || email,
    subject,
    html
  };

  try {
    // Verify connection before sending
    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email} (id: ${info.messageId})`);
    return { success: true, info };
  } catch (error) {
    console.error('Error sending verification email:', error && error.message ? error.message : error);
    // Fallback: log to console for dev, but return a failure so caller can react
    logEmailToConsole(email, subject, html);
    return { success: false, error: error && error.message ? error.message : String(error) };
  }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (email, orderData, name) => {
  const transporter = createTransporter();
  
  const { orderId, items, total, shippingAddress, phoneNumber } = orderData;
  
  // Calculate items HTML
  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 15px 0; color: #1f2937;">${item.name}</td>
      <td style="padding: 15px 0; text-align: center; color: #6b7280;">${item.quantity}</td>
      <td style="padding: 15px 0; text-align: right; color: #1f2937; font-weight: bold;">${item.price} Lek</td>
    </tr>
  `).join('');
  
  const subject = `Konfirmimi i porosisë #${orderId} - Nabis Farmaci`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Konfirmimi i Porosisë</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #ec4899; font-size: 32px; margin: 0;">
            Nabis <span style="color: #22c55e;">Farmaci</span>
          </h1>
          <p style="color: #6b7280; margin: 10px 0 0 0;">Farmacia juaj online e besuar</p>
        </div>
        
        <!-- Content -->
        <div>
          <h2 style="color: #1f2937; margin-bottom: 20px;">Faleminderit për porosinë, ${name}!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            Porosia juaj është pranuar me sukses dhe do të përpunohet së shpejti.
          </p>
          
          <!-- Order Details -->
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Detajet e Porosisë</h3>
            <p style="color: #6b7280; margin: 5px 0;"><strong>Numri i Porosisë:</strong> #${orderId}</p>
            <p style="color: #6b7280; margin: 5px 0;"><strong>Adresa e Dërgesës:</strong> ${shippingAddress}</p>
            <p style="color: #6b7280; margin: 5px 0;"><strong>Telefoni:</strong> ${phoneNumber}</p>
          </div>
          
          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb;">
                <th style="text-align: left; padding: 15px 0; color: #1f2937;">Produkti</th>
                <th style="text-align: center; padding: 15px 0; color: #1f2937;">Sasia</th>
                <th style="text-align: right; padding: 15px 0; color: #1f2937;">Çmimi</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr style="border-top: 2px solid #e5e7eb;">
                <td colspan="2" style="text-align: right; padding: 15px 0; color: #1f2937; font-weight: bold;">Totali:</td>
                <td style="text-align: right; padding: 15px 0; color: #ec4899; font-weight: bold; font-size: 18px;">${total} Lek</td>
              </tr>
            </tfoot>
          </table>
          
          <!-- Footer Info -->
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="color: #92400e; margin: 0; font-weight: bold;">ℹ️ Informacion i Rëndësishëm</p>
            <p style="color: #92400e; margin: 10px 0 0 0; font-size: 14px;">
              Porosia do të dërgohet brenda 24-48 orëve. Do të kontaktoheni në numrin e dhënë para se të bëhet dërgesa.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 40px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
            Faleminderit që zgjodhët Nabis Farmaci!
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © 2025 Nabis Farmaci. Të gjitha të drejtat të rezervuara.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    logEmailToConsole(email, subject, html);
    return { success: false, error: 'SMTP_NOT_CONFIGURED' };
  }

  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const fromName = process.env.EMAIL_FROM_NAME || 'Nabis Farmaci';

  const mailOptions = {
    from: `${fromName} <${fromAddress}>`,
    to: email,
    subject,
    html
  };

  try {
    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${email} (id: ${info.messageId})`);
    return { success: true, info };
  } catch (error) {
    console.error('Error sending order confirmation email:', error && error.message ? error.message : error);
    logEmailToConsole(email, subject, html);
    return { success: false, error: error && error.message ? error.message : String(error) };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, name) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  const subject = 'Rivendosni fjalëkalimin tuaj - Nabis Farmaci';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rivendosni Fjalëkalimin</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #ec4899; font-size: 32px; margin: 0;">
            Nabis <span style="color: #22c55e;">Farmaci</span>
          </h1>
          <p style="color: #6b7280; margin: 10px 0 0 0;">Farmacia juaj online e besuar</p>
        </div>
        
        <!-- Content -->
        <div style="text-align: center;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Rivendosni Fjalëkalimin</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            Përshëndetje ${name}, kemi marrë një kërkesë për të rivendosur fjalëkalimin tuaj. Klikoni butonin më poshtë për të vazhduar:
          </p>
          
          <!-- Reset Button -->
          <div style="margin: 40px 0;">
            <a href="${resetUrl}" 
               style="background-color: #ec4899; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Rivendosni Fjalëkalimin
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Linku është i vlefshëm për 1 orë. Nëse nuk e keni kërkuar këtë rivendosje, injoroni këtë email.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 40px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
            © 2025 Nabis Farmaci. Të gjitha të drejtat të rezervuara.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    logEmailToConsole(email, subject, html);
    console.log(`🔗 PASSWORD RESET URL: ${resetUrl}`);
    return { success: false, error: 'SMTP_NOT_CONFIGURED' };
  }

  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const fromName = process.env.EMAIL_FROM_NAME || 'Nabis Farmaci';

  const mailOptions = {
    from: `${fromName} <${fromAddress}>`,
    to: email,
    subject,
    html
  };

  try {
    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email} (id: ${info.messageId})`);
    return { success: true, info };
  } catch (error) {
    console.error('Error sending password reset email:', error && error.message ? error.message : error);
    logEmailToConsole(email, subject, html);
    return { success: false, error: error && error.message ? error.message : String(error) };
  }
};

// Send temporary login code
const sendTemporaryLoginCode = async (email, loginCode, name) => {
  const transporter = createTransporter();
  
  const subject = 'Kodi juaj i hyrjes së përkohshme - Nabis Farmaci';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Kodi i Hyrjes së Përkohshme</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #ec4899; font-size: 32px; margin: 0;">
            Nabis <span style="color: #22c55e;">Farmaci</span>
          </h1>
          <p style="color: #6b7280; margin: 10px 0 0 0;">Farmacia juaj online e besuar</p>
        </div>
        
        <!-- Content -->
        <div style="text-align: center;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Kodi juaj i Hyrjes</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            Përshëndetje ${name}, ju kërkuat një kod për të hyrë në llogarinë tuaj. Futni kodin më poshtë:
          </p>
          
          <!-- Login Code -->
          <div style="background-color: #f3f4f6; padding: 30px; border-radius: 12px; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
              Kodi i Hyrjes
            </p>
            <div style="font-size: 36px; font-weight: bold; color: #1f2937; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${loginCode}
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 30px;">
            Ky kod është i vlefshëm për 15 minuta dhe mund të përdoret vetëm një herë.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 40px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
            © 2025 Nabis Farmaci. Të gjitha të drejtat të rezervuara.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    logEmailToConsole(email, subject, html);
    console.log(`🔑 LOGIN CODE: ${loginCode}`);
    return { success: false, error: 'SMTP_NOT_CONFIGURED' };
  }

  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const fromName = process.env.EMAIL_FROM_NAME || 'Nabis Farmaci';

  const mailOptions = {
    from: `${fromName} <${fromAddress}>`,
    to: email,
    subject,
    html
  };

  try {
    console.log(`📧 Sending temporary login code to ${email}...`);
    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully (ID: ${info.messageId})`);
    return { success: true, info };
  } catch (error) {
    console.error('❌ Failed to send email:', error && error.message ? error.message : error);
    logEmailToConsole(email, subject, html);
    return { success: false, error: error && error.message ? error.message : String(error) };
  }
};

// Send order verification code
const sendOrderVerificationCode = async (email, orderNumber, verificationCode) => {
  const transporter = createTransporter();
  
  const subject = `Verifikoni porosinë tuaj #${orderNumber} - Nabis Farmaci`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verifikimi i Porosisë</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #ec4899; font-size: 32px; margin: 0;">
            Nabis <span style="color: #22c55e;">Farmaci</span>
          </h1>
          <p style="color: #6b7280; margin: 10px 0 0 0;">Farmacia juaj online e besuar</p>
        </div>
        
        <!-- Content -->
        <div style="text-align: center;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Verifikoni Porosinë Tuaj</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Faleminderit për porosinë tuaj në Nabis Farmaci!
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            Numri i porosisë: <strong style="color: #1f2937;">#${orderNumber}</strong>
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            Për të konfirmuar porosinë tuaj, ju lutemi futni kodin e verifikimit më poshtë:
          </p>
          
          <!-- Verification Code -->
          <div style="background-color: #f3f4f6; padding: 30px; border-radius: 12px; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
              Kodi i Verifikimit
            </p>
            <div style="font-size: 36px; font-weight: bold; color: #1f2937; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${verificationCode}
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 30px;">
            Ky kod është i vlefshëm për 15 minuta dhe mund të përdoret vetëm një herë.
          </p>
          
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              <strong>Rëndësishme:</strong> Porosia juaj do të përgatitet dhe dërgohet vetëm pasi të verifikohet me kodin e mësipërm.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 40px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
            © 2025 Nabis Farmaci. Të gjitha të drejtat të rezervuara.
          </p>
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            Nëse nuk kemi bërë këtë porosi, ju lutemi kontaktoni me ne menjëherë.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    logEmailToConsole(email, subject, html);
    console.log(`🔑 VERIFICATION CODE FOR ORDER #${orderNumber}: ${verificationCode}`);
    return { success: false, error: 'SMTP_NOT_CONFIGURED' };
  }

  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const fromName = process.env.EMAIL_FROM_NAME || 'Nabis Farmaci';

  const mailOptions = {
    from: `${fromName} <${fromAddress}>`,
    to: email,
    subject,
    html
  };

  try {
    console.log(`📧 Attempting to send verification email to ${email}...`);
    await transporter.verify();
    console.log('✅ Email server connection verified');
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Order verification email sent successfully to ${email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`🔑 Verification code: ${verificationCode}`);
    return { success: true, info };
  } catch (error) {
    console.error('❌ Failed to send order verification email:', error && error.message ? error.message : error);
    logEmailToConsole(email, subject, html);
    console.log(`🔑 VERIFICATION CODE FOR ORDER #${orderNumber}: ${verificationCode}`);
    return { success: false, error: error && error.message ? error.message : String(error) };
  }
};

// Send order status update email (e.g., when order is out for delivery or delivered)
const sendOrderStatusUpdateEmail = async (email, orderNumber, status, name) => {
  const transporter = createTransporter();

  const statusTextMap = {
    in_delivery: 'Në dërgesë',
    shipped: 'Dërguar',
    delivered: 'Dorëzuar',
    processing: 'Në përpunim',
    confirmed: 'Konfirmuar',
    cancelled: 'Anulluar',
    pending: 'Në pritje'
  };

  const prettyStatus = statusTextMap[status] || status;
  const statusMessageMap = {
    pending: 'Porosia juaj është regjistruar dhe po pret konfirmim nga administrata.',
    confirmed: 'Porosia juaj është konfirmuar nga stafi ynë dhe do të përgatitet.',
    processing: 'Porosia po përpunohet dhe do të jetë gati për dërgesë së shpejti.',
    shipped: 'Porosia juaj është dorëzuar tek korrieri dhe është nisur.',
    in_delivery: 'Porosia është në dërgesë dhe pritet të dorëzohet së shpejti.',
    delivered: 'Porosia juaj është dorëzuar. Shpresojmë që jeni të kënaqur!',
    cancelled: 'Porosia juaj është anulluar. Nëse mendoni se ky është një gabim, kontaktoni suportin.'
  };

  const statusMessage = statusMessageMap[status] || `Statusi i porosisë u përditësua në: ${prettyStatus}`;

  const subject = `Statusi i porosisë #${orderNumber} - ${prettyStatus} - Nabis Farmaci`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Statusi i Porosisë</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #ec4899; font-size: 28px; margin: 0;">Nabis <span style="color: #22c55e;">Farmaci</span></h1>
        </div>
        <div>
          <h2 style="color: #1f2937;">Përshëndetje ${name || ''},</h2>
          <p style="color: #4b5563; font-size: 16px;">Statusi i porosisë suaj me numër <strong>#${orderNumber}</strong> është përditësuar në: <strong>${prettyStatus}</strong>.</p>

          <p style="color: #4b5563; font-size: 16px;">${statusMessage}</p>

          <p style="color: #4b5563; font-size: 16px;">Nëse keni pyetje rreth porosisë, mund të na kontaktoni nëpërmjet emailit ose telefonit të dhënë në porosi.</p>
        </div>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 30px; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">© 2025 Nabis Farmaci. Ky email u dërgua automatikisht.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    logEmailToConsole(email, subject, html);
    return { success: false, error: 'SMTP_NOT_CONFIGURED' };
  }

  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const fromName = process.env.EMAIL_FROM_NAME || 'Nabis Farmaci';

  const mailOptions = {
    from: `${fromName} <${fromAddress}>`,
    to: email,
    subject,
    html
  };

  try {
    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Order status email sent to ${email} (id: ${info.messageId})`);
    return { success: true, info };
  } catch (error) {
    console.error('Error sending order status email:', error && error.message ? error.message : error);
    logEmailToConsole(email, subject, html);
    return { success: false, error: error && error.message ? error.message : String(error) };
  }
};

module.exports = {
  sendVerificationEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  sendTemporaryLoginCode,
  sendOrderVerificationCode,
  sendOrderStatusUpdateEmail
};

