import app from './app.js';
import connectDB from './config/database.js';

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
    ╔═══════════════════════════════════════╗
    ║   Server running on port ${PORT}        ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}           ║
    ║   API: http://localhost:${PORT}/api    ║
    ╚═══════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
