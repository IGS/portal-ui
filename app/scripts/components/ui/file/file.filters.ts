module ngApp.components.ui.file {

  function FileSize() {
    const BYTES_PB = 1000000000000000;
    const BYTES_TB_LIMIT = 999999500000000;
    const BYTES_TB = 1000000000000;
    const BYTES_GB_LIMIT = 999999500000;
    const BYTES_GB = 1000000000;
    const BYTES_MB_LIMIT = 999500000;
    const BYTES_MB = 1000000;
    const BYTES_KB_LIMIT = 999500;
    const BYTES_KB = 1000;

    return function (val: number) {
      var formattedVal: string = "0 B";

      if (val >= BYTES_TB_LIMIT) {
        formattedVal = (val / BYTES_PB).toFixed(2) + " PB";
      } else if (val >= BYTES_GB_LIMIT) {
        formattedVal = (val / BYTES_TB).toFixed(2) + " TB";
      } else if (val >= BYTES_MB_LIMIT) {
        formattedVal = (val / BYTES_GB).toFixed(2) + " GB";
      } else if (val >= BYTES_KB_LIMIT) {
        formattedVal = (val / BYTES_MB).toFixed(2) + " MB";
      } else if (val >= BYTES_KB) {
        formattedVal = (val / BYTES_KB).toFixed(0) + " KB";
      } else if (val) {
        formattedVal = val + " B";
      }

      return formattedVal;
    };
  }

  angular.module("file.filters", [])
      .filter("size", FileSize);
}
