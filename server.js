import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// SMTP configuration
const smtpHost = process.env.SMTP_HOST || 'mail.infomaniak.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER || 'gestion@geotasalia.es';
const smtpPass = process.env.SMTP_PASS || 'CorreoWebVps2026@@';
const smtpTo = process.env.SMTP_TO || 'jorge.martinez@geotasalia.es';
const smtpBcc = process.env.SMTP_BCC || 'arnydivision@gmail.com';

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // True for 465, false for 587 or other ports
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  tls: {
    rejectUnauthorized: false // Avoid issues with self-signed certs or sandbox environments
  }
});

// Enable JSON body parsing for API requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Paths
const distPath = path.join(__dirname, 'dist');
const DB_FILE = path.join(__dirname, 'consultas.json');

// Helper to read submissions
function readSubmissions() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading submissions file:', error);
    return [];
  }
}

// Helper to write submissions
function writeSubmissions(submissions) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(submissions, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing submissions file:', error);
    return false;
  }
}

// Middleware to authorize admin access
function adminAuthorize(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1] || req.headers['x-admin-token'];
  if (token === 'admin2026') {
    next();
  } else {
    res.status(401).json({ error: 'Acceso no autorizado. Se requieren credenciales de administración.' });
  }
}

// API Route: Send / Create a new contact inquiry
app.post('/api/contacto', async (req, res) => {
  try {
    const { name, email, phone, service, cadastralRef, message, rgpdAccepted, attachedFiles } = req.body;

    if (!name || !email || !phone || !service || !rgpdAccepted) {
      return res.status(400).json({ error: 'Faltan campos requeridos en la consulta.' });
    }

    const submissions = readSubmissions();
    const newSubmission = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      name,
      email,
      phone,
      service,
      cadastralRef: cadastralRef || '',
      message: message || '',
      rgpdAccepted,
      attachedFiles: attachedFiles || [],
      status: 'unread', // unread, read, archived
      createdAt: new Date().toISOString()
    };

    // Attempt to send email via SMTP
    const subject = `[GeoTasalia] Solicitud de Consulta Técnica: ${service}`;
    
    let filesListText = '';
    if (attachedFiles && attachedFiles.length > 0) {
      filesListText = `\nDOCUMENTACIÓN ADJUNTA PRESENTADA (${attachedFiles.length} archivos):\n` +
        attachedFiles.map(f => `- ${f.name} (${(f.size / 1024 / 1024).toFixed(2)} MB)`).join('\n') + `\n`;
    }

    const bodyText = 
      `Estimado Jorge,\n\n` +
      `Se ha recibido una nueva consulta técnica desde el portal corporativo GeoTasalia:\n\n` +
      `-----------------------------------------\n` +
      `Nombre: ${name}\n` +
      `Email: ${email}\n` +
      `Teléfono: ${phone}\n` +
      `Servicio solicitado: ${service}\n` +
      `Ref. Catastral: ${cadastralRef || 'No aportada'}\n` +
      `${filesListText}` +
      `-----------------------------------------\n\n` +
      `Descripción de la Consulta:\n` +
      `"${message || 'Sin observaciones adicionales'}"\n\n` +
      `-----------------------------------------\n\n` +
      `✓ El cliente ha aceptado de forma expresa la política de protección de datos (RGPD) de GeoTasalia.\n\n` +
      `Un saludo,\n` +
      `Sistema de Soporte GeoTasalia`;

    try {
      await transporter.sendMail({
        from: `"GeoTasalia" <${smtpUser}>`,
        to: smtpTo,
        bcc: smtpBcc,
        replyTo: email,
        subject: subject,
        text: bodyText
      });
      console.log('Email sent successfully via SMTP');
    } catch (mailError) {
      console.error('Failed to send email via SMTP:', mailError);
      return res.status(500).json({ 
        error: 'No se pudo enviar el correo electrónico a través del servidor SMTP: ' + mailError.message, 
        smtpError: true 
      });
    }

    submissions.push(newSubmission);
    if (writeSubmissions(submissions)) {
      res.status(201).json({ success: true, message: 'Consulta registrada y enviada correctamente por correo.', id: newSubmission.id });
    } else {
      res.status(500).json({ error: 'El correo fue enviado, pero hubo un error interno al guardar la consulta en el panel de control.' });
    }
  } catch (error) {
    console.error('Error in POST /api/contacto:', error);
    res.status(500).json({ error: 'Error del servidor al procesar la solicitud.' });
  }
});

// API Route: Retrieve all contact inquiries (Admin Only)
app.get('/api/consultas', adminAuthorize, (req, res) => {
  const submissions = readSubmissions();
  // Return sorted from newest to oldest
  submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(submissions);
});

// API Route: Toggle read status of a consultation (Admin Only)
app.put('/api/consultas/:id/read', adminAuthorize, (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'read' or 'unread'
  
  const submissions = readSubmissions();
  const index = submissions.findIndex(item => item.id === id);
  
  if (index !== -1) {
    submissions[index].status = status === 'unread' ? 'unread' : 'read';
    writeSubmissions(submissions);
    res.json({ success: true, updated: submissions[index] });
  } else {
    res.status(404).json({ error: 'Consulta no encontrada.' });
  }
});

// API Route: Delete an inquiry (Admin Only)
app.delete('/api/consultas/:id', adminAuthorize, (req, res) => {
  const { id } = req.params;
  const submissions = readSubmissions();
  const filtered = submissions.filter(item => item.id !== id);
  
  if (submissions.length !== filtered.length) {
    writeSubmissions(filtered);
    res.json({ success: true, message: 'Consulta eliminada correctamente.' });
  } else {
    res.status(404).json({ error: 'Consulta no encontrada.' });
  }
});

// Serve static assets or use Vite middleware
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);

  // Serve transformed index.html for all client-side routes in dev mode
  app.get('*', async (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    const url = req.originalUrl;
    try {
      let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
} else {
  // Serve static assets from dist folder
  app.use(express.static(distPath));

  // Fallback all other requests to index.html for SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
