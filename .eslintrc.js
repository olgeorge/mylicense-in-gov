module.exports = {
    "parser": "babel-eslint",
    "rules": {
        "strict": 0
    },
    "parserOptions": {
        "ecmaVersion": 8
    },
    "env": {
        "commonjs": true,
        "node": true,
        "mocha": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "Promise": true,
        "Proxy": true,
        "Map": true,
        "Set": true,
    },
    "rules": {
        "indent": [
            "warn",
            4,
            {"SwitchCase": 1}
        ],
        "no-trailing-spaces": "error",
        "no-unused-vars": [
            "warn",
            {"args": "none"}
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-console": "off",
        "no-extra-boolean-cast": "off",
        "comma-dangle": "off",
    }
};
