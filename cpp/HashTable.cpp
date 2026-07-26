#include "HashTable.h"

HashTable::HashTable(int cap) : capacity(cap), size(0) {
    table.resize(capacity, nullptr);
}

HashTable::~HashTable() {
    for (int i = 0; i < capacity; i++) {
        HashNode* entry = table[i];
        while (entry != nullptr) {
            HashNode* prev = entry;
            entry = entry->next;
            delete prev;
        }
        table[i] = nullptr;
    }
}

uint64_t HashTable::polynomialRollingHash(const std::string& key) const {
    const int p = 53;
    const uint64_t m = 1e9 + 9;
    uint64_t hash_value = 0;
    uint64_t p_pow = 1;
    for (char c : key) {
        hash_value = (hash_value + (c - 'a' + 1) * p_pow) % m;
        p_pow = (p_pow * p) % m;
    }
    return hash_value;
}

void HashTable::insert(const std::string& key, const std::string& value) {
    uint64_t hash_val = polynomialRollingHash(key);
    int bucketIndex = hash_val % capacity;

    HashNode* entry = table[bucketIndex];
    if (entry == nullptr) {
        table[bucketIndex] = new HashNode(key, value);
        size++;
    } else {
        while (entry != nullptr) {
            if (entry->key == key) {
                entry->value = value;
                return;
            }
            if (entry->next == nullptr) break;
            entry = entry->next;
        }
        entry->next = new HashNode(key, value);
        size++;
    }
}

std::string HashTable::search(const std::string& key) const {
    uint64_t hash_val = polynomialRollingHash(key);
    int bucketIndex = hash_val % capacity;

    HashNode* entry = table[bucketIndex];
    while (entry != nullptr) {
        if (entry->key == key) {
            return entry->value;
        }
        entry = entry->next;
    }
    return "";
}

void HashTable::remove(const std::string& key) {
    uint64_t hash_val = polynomialRollingHash(key);
    int bucketIndex = hash_val % capacity;

    HashNode* entry = table[bucketIndex];
    HashNode* prev = nullptr;

    while (entry != nullptr && entry->key != key) {
        prev = entry;
        entry = entry->next;
    }

    if (entry == nullptr) return; // Key not found

    if (prev == nullptr) {
        table[bucketIndex] = entry->next; // Delete head
    } else {
        prev->next = entry->next;
    }
    delete entry;
    size--;
}

void HashTable::update(const std::string& key, const std::string& newValue) {
    insert(key, newValue);
}

bool HashTable::isValuePresent(const std::string& value) const {
    for (int i = 0; i < capacity; i++) {
        HashNode* entry = table[i];
        while (entry != nullptr) {
            if (entry->value == value) {
                return true;
            }
            entry = entry->next;
        }
    }
    return false;
}
#include "Base62.h"

std::string HashTable::hashToBase62(const std::string& key, int attempt) const {
    uint64_t hash_val = polynomialRollingHash(key + std::to_string(attempt));
    return Base62::encode(hash_val);
}

std::string HashTable::generateUnique(const std::string& key) {
    // If already exists, return existing
    std::string existing = search(key);
    if (!existing.empty()) return existing;

    int attempt = 0;
    std::string shortCode;
    do {
        shortCode = hashToBase62(key, attempt);
        attempt++;
    } while (isValuePresent(shortCode)); // Collision resolution by rehashing

    insert(key, shortCode);
    return shortCode;
}
