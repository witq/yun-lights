#define RF_DATA_PIN    8

#define SHORT_DELAY       380
#define NORMAL_DELAY      500
#define SIGNAL_DELAY     1500

#define SYNC_DELAY       2650
#define EXTRASHORT_DELAY 3000
#define EXTRA_DELAY     10000

void sendSignal(unsigned long signal) {

  digitalWrite(RF_DATA_PIN,LOW);
  delayMicroseconds(1000);
 
  for (unsigned char i=0; i<4; i++) { // repeat 1st signal sequence 4 times
    sendSync();
    for (unsigned char k=0; k<24; k++) { //as 24 long and short signals, this loop sends each one and if it is long, it takes it away from total delay so that there is a short between it and the next signal and viceversa
      sendValue(bitRead(signal, 23-k),SHORT_DELAY);
    }    
  }
  for (unsigned char i=0; i<4; i++) { // repeat 2nd signal sequence 4 times with NORMAL DELAY
    longSync();  
    for (unsigned char k=0; k<24; k++) {
      sendValue(bitRead(signal, 23-k),NORMAL_DELAY);
    }
  }
  
}

void sendSync(){
  digitalWrite(RF_DATA_PIN, HIGH);
  delayMicroseconds(SHORT_DELAY);
  digitalWrite(RF_DATA_PIN, LOW);
  delayMicroseconds(SYNC_DELAY - SHORT_DELAY);  
}

void sendValue(boolean value, unsigned int base_delay){
  unsigned long d = value? SIGNAL_DELAY - base_delay : base_delay;
  digitalWrite(RF_DATA_PIN, HIGH);
  delayMicroseconds(d);
  digitalWrite(RF_DATA_PIN, LOW);
  delayMicroseconds(SIGNAL_DELAY - d);
}

void longSync(){
  digitalWrite(RF_DATA_PIN, HIGH);
  delayMicroseconds(EXTRASHORT_DELAY);
  digitalWrite(RF_DATA_PIN, LOW);
  delayMicroseconds(EXTRA_DELAY - EXTRASHORT_DELAY);  
}

