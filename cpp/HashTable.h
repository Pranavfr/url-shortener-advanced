#ifndef HASHTABLE_H
#define HASHTABLE_H

#include <string>
#include <vector>
#include <cstdint>

struct HashNode {
    std::string key;      // Original URL
    std::string value;    // Short Code
    HashNode* next;

    HashNode(std::string k, std::string v) : key(k), value(v), next(nullptr) {}
};

class HashTable {
private:
    std::vector<HashNode*> table;
    int capacity;
    int size;

    // Polynomial Rolling Hash function
    uint64_t polynomialRollingHash(const std::string& key) const;

public:
    HashTable(int cap = 10007);
    ~HashTable();

    // Core operations
    void insert(const std::string& key, const std::string& value);
    std::string search(const std::string& key) const;
    void remove(const std::string& key);
    void update(const std::string& key, const std::string& newValue);

    // Check if a short code exists (for collision resolution)
    bool isValuePresent(const std::string& value) const;

    // Collision aware generation helper
    std::string generateUnique(const std::string& key);
    
    // Hash string to Base62
    std::string hashToBase62(const std::string& key, int attempt = 0) const;

    int getSize() const { return size; }
};

#endif
