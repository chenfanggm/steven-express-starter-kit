module.exports = function () {
  return {
    device: { type: String },
    ip: { type: String },
    refreshToken: { type: String },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true }
  }
}
