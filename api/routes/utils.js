const b64encode = (input) => {
  var swaps = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "+",
      "/"
    ],
    tb,
    ib = "",
    output = "",
    i,
    L
  for (i = 0, L = input.length; i < L; i++) {
    tb = input.charCodeAt(i).toString(2)
    while (tb.length < 8) {
      tb = "0" + tb
    }
    ib = ib + tb
    while (ib.length >= 6) {
      output = output + swaps[parseInt(ib.substring(0, 6), 2)]
      ib = ib.substring(6)
    }
  }
  if (ib.length == 4) {
    tb = ib + "00"
    output += swaps[parseInt(tb, 2)] + "="
  }
  if (ib.length == 2) {
    tb = ib + "0000"
    output += swaps[parseInt(tb, 2)] + "=="
  }
  return output
}
module.exports = { b64encode }
