const triggerError = (req, res, next) => {
  // Esta es una excepción intencional
  throw new Error("Intentional server error triggered!")
}

module.exports = { triggerError }