const yaml = require('js-yaml');
const fs = require('fs');

exports.load = stage => {
    return yaml.safeLoad(fs.readFileSync(`secrets.${stage}.yml`, 'utf8'));
}

exports.loadToEnv = stage => {
    const secrets = exports.load(stage);
    process.env = Object.assign({}, process.env, secrets);
    return secrets;
}
