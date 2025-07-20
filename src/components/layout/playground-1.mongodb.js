/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('edutestpro');

// Create a new document in the collection.
db.getCollection('users').insertOne({
  name: 'AK Murmu',
  email: 'hackak@gmail.com',
  password: '$2a$12$tcXtEe72BGZvQ7oCVDAQb.yRvi/5qkwQ0IKQbwlnKJZI9Gd1CFF42',
  'class': '9th Grade',
  subjects: [
    'Mathematics'
  ],
  role: 'admin',
  isActive: true,
});
