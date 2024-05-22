{ 
  description = "master-thesis";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    rust-overlay.url = "github:oxalica/rust-overlay";
  };

  outputs = inputs: with inputs; flake-utils.lib.eachDefaultSystem (system: let
    pkgs = import nixpkgs {
      inherit system;
      overlays = [
        rust-overlay.overlays.default
      ];
    };

    rust = pkgs.rust-bin.stable.latest.default.override {
      targets = [ "wasm32-unknown-unknown" ];
    };

    sharedDeps = with pkgs; [ 
      wasm-pack
      rust
    ];
  in with pkgs; {
    devShell = pkgs.mkShell {
      buildInputs = sharedDeps ++ [
        corepack
        nodejs
        
        playwright-driver.browsers
      ];

      PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1;
      PLAYWRIGHT_NODEJS_PATH = "${pkgs.nodejs}/bin/node";

      PLAYWRIGHT_BROWSERS_PATH="${pkgs.playwright-driver.browsers}";
      PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = true;
    };
  });
}
