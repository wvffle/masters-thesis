# { 
#   description = "master-thesis";
# 
#   inputs = {
#     nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
#     flake-utils.url = "github:numtide/flake-utils";
#     rust-overlay.url = "github:oxalica/rust-overlay";
#   };
# 
#   outputs = inputs: with inputs; flake-utils.lib.eachDefaultSystem (system: let
# 
# 
#   in with pkgs; {
#     devShell = pkgs.mkShell {
#       buildInputs = sharedDeps ++ [
#         playwright-driver.browsers
#       ];
# 
#       PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1;
#       PLAYWRIGHT_NODEJS_PATH = "${pkgs.nodejs}/bin/node";
# 
#       PLAYWRIGHT_BROWSERS_PATH="${pkgs.playwright-driver.browsers}";
#       PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = true;
#     };
#   });
# }
{
  description = "masters-thesis";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

    flake-utils.url = "github:numtide/flake-utils";
    flake-utils.inputs.nixpkgs.follows = "nixpkgs";

    devenv.url = "github:cachix/devenv";
    devenv.inputs.nixpkgs.follows = "nixpkgs";

    flake-parts.url = "github:hercules-ci/flake-parts";
    flake-parts.inputs.nixpkgs.follows = "nixpkgs";

    fenix.url = "github:nix-community/fenix";
    fenix.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = inputs@{ flake-parts, nixpkgs, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [ inputs.devenv.flakeModule ];
      systems = nixpkgs.lib.systems.flakeExposed;

      perSystem = { config, pkgs, ... }: {
        devenv.shells.default = {
          dotenv.disableHint = true;

          languages.javascript = {
            enable = true;
            pnpm.enable = true;
            pnpm.install.enable = true;
          };

          languages.rust = {
            enable = true;
            channel = "stable"; # FIX: remove when upstream fixed: https://github.com/cachix/devenv/issues/1223
            targets = [ "wasm32-unknown-unknown" ];
          };

          packages = with pkgs; [
            wasm-pack
          ];
          
          enterShell = ''
            export RUSTC_WRAPPER="${pkgs.sccache}/bin/sccache"
          '';
        };
      };
    };
}
