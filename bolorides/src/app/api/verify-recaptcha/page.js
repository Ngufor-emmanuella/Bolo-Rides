// // pages/api/verify-recaptcha.js
// export default async function handler(req, res) {
//     const { token } = req.body;
//     const secret = process.env.RECAPTCHA_SECRET_KEY;
//     const response = await fetch(
//       `https://www.google.com/recaptcha/api/siteverify`,
//       {
//         method: 'POST',
//         body: new URLSearchParams({
//           secret,
//           response: token,
//         }),
//       }
//     );
//     const data = await response.json();
//     if (data.success && data.score > 0.5) {
//       res.status(200).json({ success: true });
//     } else {
//       res.status(400).json({ success: false });
//     }
//   }
  