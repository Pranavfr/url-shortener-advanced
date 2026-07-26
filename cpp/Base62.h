#ifndef BASE62_H
#define BASE62_H

#include <string>
#include <cstdint>

class Base62 {
private:
    static const std::string BASE62_CHARS;

public:
    static std::string encode(uint64_t num);
};

#endif
