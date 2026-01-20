/**
 * Converts a Multer file object into a GoogleGenerativeAI friendly format
 * @param {Object} file - The file object from req.file
 * @returns {Object} - The inlineData object required by Gemini
 */
export const fileToGenerativePart = (file) => {
  return {
    inlineData: {
      data: file.buffer.toString('base64'),
      mimeType: file.mimetype,
    },
  };
};
