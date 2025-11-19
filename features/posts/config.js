/**
 * Posts Module Configuration
 * SMMS-F-005, F-006, F-007, F-008, F-012
 */

module.exports = {
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
  content: {
    titleMaxLength: 200,
    contentMinLength: 1,
    contentMaxLength: 5000,
  },
  uploadsDir: 'public/uploads',
  urlPath: '/uploads',
};
