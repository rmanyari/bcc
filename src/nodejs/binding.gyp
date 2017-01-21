{
  "targets": [
    {
      "target_name": "libbcc",
      "sources": [ "libbcc.cc" ],
      "variables": {
        "cc_root%": "../cc/",
        "libbcc_root%": "/usr/lib/x86_64-linux-gnu/"
      },
      "include_dirs": [
          "<!(node -e \"require('nan')\")",
          "<@(cc_root)>",
      ],
      "link_settings": {
        "libraries": [ "/usr/lib/x86_64-linux-gnu/libbcc.so.0" ]
      },
      "cflags": [ "-fPIC" ]
    }
  ]
}
