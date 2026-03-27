import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_to_pass_build');

export async function sendAlertEmail(userEmail: string, alertDetails: any) {
  const { from_currency, to_currency, target_rate, bestRate, bestProvider, link } = alertDetails;
  
  const fromCurr = from_currency === 'GBP' ? '£' : from_currency === 'USD' ? '$' : from_currency;

  try {
    const data = await resend.emails.send({
      from: 'RemitAI <alerts@remitaiapp.com>', 
      to: userEmail,
      subject: `🎯 Your rate alert triggered! ${from_currency}→${to_currency} hit your target`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #2563eb;">Good news! Your rate alert was triggered.</h1>
          <p>You asked us to tell you when the rate for <strong>${from_currency} to ${to_currency}</strong> hit your target of <strong>${target_rate}</strong>.</p>
          
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0; color: #166534; font-size: 14px; text-transform: uppercase; font-weight: bold;">Current Best Rate</p>
            <h2 style="margin: 8px 0 0 0; color: #15803d; font-size: 32px;">1 ${fromCurr} = ${bestRate.toFixed(2)} ${to_currency}</h2>
            <p style="margin: 8px 0 0 0; color: #166534;">via <strong>${bestProvider}</strong></p>
          </div>

          <p>Rates change quickly. If you're ready to send money, you can lock in this rate now.</p>
          
          <a href="${link}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 16px;">
            Transfer with ${bestProvider}
          </a>
          
          <p style="margin-top: 32px; font-size: 12px; color: #6b7280;">
            You received this because you set up a rate alert on RemitAI.<br>
            Rates and fees are subject to change. Please verify the final amount on the provider's website.
          </p>
        </div>
      `
    });
    
    if (data.error) {
        throw new Error(data.error.message);
    }

    console.log(`Alert email sent to ${userEmail} for target ${target_rate}`);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
