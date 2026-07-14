function validEvent(overrides = {}) {
  return {
    title: 'Test Event',
    category: 'conference',
    date: '2026-12-25T10:00:00.000Z',
    ...overrides,
  };
}

function validBooking(overrides = {}) {
  return {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    eventType: 'Wedding',
    eventDate: '2026-12-25',
    ...overrides,
  };
}

function validGalleryItem(overrides = {}) {
  return {
    title: 'Test Gallery Item',
    category: 'weddings',
    type: 'image',
    ...overrides,
  };
}

function validService(overrides = {}) {
  return {
    icon: 'mic',
    title: 'MC Service',
    ...overrides,
  };
}

function validTestimonial(overrides = {}) {
  return {
    name: 'Jane Doe',
    review: 'Amazing MC! Highly recommend.',
    rating: 5,
    ...overrides,
  };
}

function validFAQ(overrides = {}) {
  return {
    question: 'What is your availability?',
    answer: 'I am available on weekends.',
    ...overrides,
  };
}

function validContact(overrides = {}) {
  return {
    name: 'John Smith',
    email: 'john@test.com',
    message: 'I would like to book your services.',
    ...overrides,
  };
}

module.exports = {
  validEvent,
  validBooking,
  validGalleryItem,
  validService,
  validTestimonial,
  validFAQ,
  validContact,
};
