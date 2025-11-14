// plugins/withIosModularHeaders.js
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withIosModularHeaders(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfilePath = path.join(cfg.modRequest.projectRoot, 'ios', 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf8');

      // jeśli jeszcze nie ma use_modular_headers!, dodaj po linii "platform :ios ..."
      if (!contents.includes('use_modular_headers!')) {
        contents = contents.replace(
          /platform :ios, .*/,
          (line) => `${line}\n\n  use_modular_headers!`
        );
        fs.writeFileSync(podfilePath, contents);
      }

      return cfg;
    },
  ]);
}

module.exports = withIosModularHeaders;
