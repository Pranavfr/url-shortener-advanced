#include <iostream>
#include <string>
#include <sstream>
#include "HashTable.h"

int main() {
    HashTable ht;
    std::string line;
    
    // Disable synchronization for faster I/O
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    while (std::getline(std::cin, line)) {
        if (line.empty()) continue;
        
        std::stringstream ss(line);
        std::string command;
        ss >> command;

        if (command == "EXIT") {
            break;
        } else if (command == "INSERT") {
            std::string key, value;
            ss >> key >> value;
            ht.insert(key, value);
            std::cout << "OK\n";
        } else if (command == "SEARCH") {
            std::string key;
            ss >> key;
            std::string result = ht.search(key);
            if (result.empty()) {
                std::cout << "NOT_FOUND\n";
            } else {
                std::cout << result << "\n";
            }
        } else if (command == "GENERATE") {
            std::string key;
            ss >> key;
            std::string result = ht.generateUnique(key);
            std::cout << result << "\n";
        } else {
            std::cout << "UNKNOWN_COMMAND\n";
        }
        std::cout << std::flush;
    }

    return 0;
}
