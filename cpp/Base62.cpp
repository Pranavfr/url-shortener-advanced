#include "Base62.h"
#include <algorithm>

const std::string Base62::BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

std::string Base62::encode(uint64_t num) {
    if (num == 0) return "0";
    
    std::string encoded = "";
    while (num > 0) {
        encoded += BASE62_CHARS[num % 62];
        num /= 62;
    }
    
    std::reverse(encoded.begin(), encoded.end());
    return encoded;
}
