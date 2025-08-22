const nodemailer = require('nodemailer');

// Email configuration
const createTransporter = () => {
  // Gmail SMTP configuration
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send verification email with 6-digit code
const sendVerificationEmail = async (email, verificationCode, name) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: {
      name: 'Nabis Farmaci',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: 'Kodi i verifikimit - Nabis Farmaci',
    html: `
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
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
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
      <td style="padding: 15px 0; text-align: right; color: #1f2937; font-weight: bold;">${item.price}€</td>
    </tr>
  `).join('');
  
  const mailOptions = {
    from: {
      name: 'Nabis Farmaci',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: `Konfirmimi i porosisë #${orderId} - Nabis Farmaci`,
    html: `
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
                  <td style="text-align: right; padding: 15px 0; color: #ec4899; font-weight: bold; font-size: 18px;">${total}€</td>
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
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, name) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: {
      name: 'Nabis Farmaci',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: 'Rivendosni fjalëkalimin tuaj - Nabis Farmaci',
    html: `
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
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Send temporary login code
const sendTemporaryLoginCode = async (email, loginCode, name) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: {
      name: 'Nabis Farmaci',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: 'Kodi juaj i hyrjes së përkohshme - Nabis Farmaci',
    html: `
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
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending temporary login code email:', error);
    return { success: false, error: error.message };
  }
};

// Send order verification code
const sendOrderVerificationCode = async (email, orderNumber, verificationCode) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: {
      name: 'Nabis Farmaci',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: `Verifikoni porosinë tuaj #${orderNumber} - Nabis Farmaci`,
    html: `
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
              Nëse nuk keni bërë këtë porosi, ju lutemi kontaktoni me ne menjëherë.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Order verification code sent to ${email} for order #${orderNumber}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending order verification code email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  sendTemporaryLoginCode,
  sendOrderVerificationCode
};
