enum TokenAlgorithm {
    SHA1 = 0,
    SHA256,
    SHA512
}

enum TokenType {
    TOTP = 0,
    HOTP,
    Steam
}

interface IEntry {
    issuer: string;
    username: string;
    icon: {
        url: string;
        dataUrl: string;
    }
    token: {
        secret: string;
        algorithm: TokenAlgorithm;
        type: TokenType
    }
}