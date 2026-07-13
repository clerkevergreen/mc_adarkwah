function mockQuery(result) {
  const q = {
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
  };
  q.then = (onFulfilled) => Promise.resolve(result).then(onFulfilled);
  q.catch = (onRejected) => Promise.resolve(result).catch(onRejected);
  return q;
}

function mockModel(overrides = {}) {
  const base = {
    create: jest.fn().mockImplementation(d =>
      Promise.resolve({
        _id: '507f1f77bcf86cd799439011',
        ...d,
        save: jest.fn().mockResolvedValue(undefined),
        toObject: () => ({ ...d }),
      })
    ),
    find: jest.fn().mockReturnValue(mockQuery([])),
    findOne: jest.fn().mockReturnValue(mockQuery(null)),
    findById: jest.fn().mockReturnValue(mockQuery(null)),
    findByIdAndUpdate: jest.fn().mockImplementation((id, update) =>
      Promise.resolve({ _id: id || '507f1f77bcf86cd799439011', ...update })
    ),
    findByIdAndDelete: jest.fn().mockResolvedValue({ _id: '507f1f77bcf86cd799439011' }),
    findOneAndUpdate: jest.fn().mockResolvedValue({ _id: '507f1f77bcf86cd799439011' }),
    countDocuments: jest.fn().mockResolvedValue(0),
    estimatedDocumentCount: jest.fn().mockResolvedValue(0),
    aggregate: jest.fn().mockResolvedValue([]),
    distinct: jest.fn().mockResolvedValue([]),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 0 }),
    updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
  };
  return { ...base, ...overrides };
}

module.exports = { mockQuery, mockModel };
