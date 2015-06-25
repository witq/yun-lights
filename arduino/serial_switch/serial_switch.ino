#include <SerialCommand.h>

SerialCommand commander;

void setup() {
  pinMode(8, OUTPUT);
  Serial1.begin(115200);
  commander.addCommand("SW", toggleSwitch);
}

void loop() {
  commander.readSerial();
}

void toggleSwitch() {
  char *signal;
  signal = commander.next();
  Serial1.print(strtoul(signal, NULL, 10));
  sendSignal(strtoul(signal, NULL, 10));
}
