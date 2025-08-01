const crypto = require('crypto-js');
const fs = require('fs').promises;
const path = require('path');

class AuthService {
  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.dataFile = path.join(__dirname, 'users.json');
    this.loadUsers();
  }

  async loadUsers() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf8');
      const usersArray = JSON.parse(data);
      usersArray.forEach(user => {
        this.users.set(user.username, user);
      });
    } catch (error) {
      // File doesn't exist or is empty, start with empty users
      console.log('No existing users file found, starting fresh');
    }
  }

  async saveUsers() {
    try {
      const usersArray = Array.from(this.users.values());
      await fs.writeFile(this.dataFile, JSON.stringify(usersArray, null, 2));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  generateRecoveryPhrase() {
    // Generate a 12-word recovery phrase (simplified version)
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
      'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
      'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
      'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'against', 'age',
      'agent', 'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm',
      'album', 'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost',
      'alone', 'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing',
      'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle',
      'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna',
      'antique', 'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve',
      'april', 'arch', 'arctic', 'area', 'arena', 'argue', 'arm', 'armed',
      'armor', 'army', 'around', 'arrange', 'arrest', 'arrive', 'arrow', 'art',
      'article', 'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset', 'assist',
      'assume', 'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract',
      'auction', 'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average',
      'avocado', 'avoid', 'awake', 'aware', 'away', 'awesome', 'awful', 'awkward'
    ];

    const phrase = [];
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * words.length);
      phrase.push(words[randomIndex]);
    }
    return phrase.join(' ');
  }

  hashPassword(password) {
    return crypto.SHA256(password).toString();
  }

  generateToken() {
    return crypto.lib.WordArray.random(32).toString();
  }

  async register(username, password) {
    if (this.users.has(username)) {
      throw new Error('Username already exists');
    }

    const hashedPassword = this.hashPassword(password);
    const recoveryPhrase = this.generateRecoveryPhrase();
    const user = {
      id: crypto.lib.WordArray.random(16).toString(),
      username,
      password: hashedPassword,
      recoveryPhrase,
      createdAt: new Date().toISOString()
    };

    this.users.set(username, user);
    await this.saveUsers();

    const token = this.generateToken();
    this.sessions.set(token, user.id);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        recoveryPhrase: user.recoveryPhrase,
        createdAt: user.createdAt
      }
    };
  }

  async login(username, password) {
    const user = this.users.get(username);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    const hashedPassword = this.hashPassword(password);
    if (user.password !== hashedPassword) {
      throw new Error('Invalid username or password');
    }

    const token = this.generateToken();
    this.sessions.set(token, user.id);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        recoveryPhrase: user.recoveryPhrase,
        createdAt: user.createdAt
      }
    };
  }

  async recoverPassword(username, recoveryPhrase, newPassword) {
    const user = this.users.get(username);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.recoveryPhrase !== recoveryPhrase) {
      throw new Error('Invalid recovery phrase');
    }

    const hashedPassword = this.hashPassword(newPassword);
    user.password = hashedPassword;
    this.users.set(username, user);
    await this.saveUsers();

    const token = this.generateToken();
    this.sessions.set(token, user.id);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        recoveryPhrase: user.recoveryPhrase,
        createdAt: user.createdAt
      }
    };
  }

  getUserFromToken(token) {
    const userId = this.sessions.get(token);
    if (!userId) return null;

    for (const user of this.users.values()) {
      if (user.id === userId) {
        return {
          id: user.id,
          username: user.username,
          recoveryPhrase: user.recoveryPhrase,
          createdAt: user.createdAt
        };
      }
    }
    return null;
  }

  logout(token) {
    this.sessions.delete(token);
  }
}

module.exports = AuthService;

