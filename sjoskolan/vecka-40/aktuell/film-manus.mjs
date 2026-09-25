// Brittisk engelsk berättarröst. Svensk skärmtext finns i lektioner.mjs.
export const FILM_SPEECH={
 sinus:[
  'Read the horizontal axis as time in milliseconds, and the vertical axis as voltage. Follow one complete cycle from a rising zero crossing to the next rising zero crossing. The curve tells us how the voltage changes with time.',
  'Frequency counts complete cycles per second. At fifty hertz, one cycle takes one divided by fifty seconds. That is zero point zero two seconds, or twenty milliseconds. Find those twenty milliseconds between matching points on the curve.',
  'Peak voltage is measured from zero to the positive peak. Peak to peak spans both the negative and positive peaks. Our twelve volt R M S sine wave reaches about sixteen point nine seven volts. Peak to peak is about thirty three point nine four volts.',
  'R M S means effective voltage. Twelve volts R M S produces the same average heating as twelve volts D C across the same resistor. For a pure sine wave, multiply R M S by the square root of two to find the peak.',
  'Before the exercise, compare both simulated meters with the ten volt sine wave calibrator. Predict each reading first. The true R M S meter and the sine calibrated meter both show ten volts for this ideal sine wave. Record both readings.',
  'Now complete one protocol entry. At fifty hertz, predict twenty milliseconds. Read twenty milliseconds in the simulator. Measured minus predicted is zero milliseconds. Explain which two matching points define the period. Pause here, then try the guided laboratory.'
 ],
 impedans:[
  'Begin with only the resistor. Twelve volts R M S across forty ohms gives zero point three amperes. Voltage and current reach their peaks together. They are in phase. The two curves are normalised so that we compare timing, rather than different units.',
  'Add an ideal inductor in series. It stores energy in a magnetic field and opposes changes in current. In the R L circuit, current reaches its peak after the source voltage. We say that current lags voltage.',
  'Our inductor is ninety five point five millihenries. First divide by one thousand to obtain zero point zero nine five five henries. Multiply by two, pi, and fifty hertz. The inductive reactance is approximately thirty ohms.',
  'Resistance is forty ohms and inductive reactance is approximately thirty ohms. Draw them as perpendicular components. The square root of forty squared plus thirty squared is fifty ohms. This is the magnitude of the impedance. Do not add the two magnitudes directly.',
  'The source still provides twelve volts R M S. Divide twelve by fifty ohms to obtain approximately zero point two four amperes. Current is smaller than the zero point three amperes with only the resistor, and it now lags the voltage.',
  'In the guided laboratory, predict reactance first, then impedance, and finally current. Read the simulated result after each calculation. Explain why the current changed and which curve reaches its peak first. Pause here and complete the laboratory using the same values.'
 ],
 effekt:[
  'Consider a single phase load at two hundred and thirty volts R M S. Its active power is eleven hundred and fifty watts. With a power factor of one, current is eleven hundred and fifty divided by two hundred and thirty, or five amperes.',
  'Power factor is active power divided by apparent power. It has no unit. For sinusoidal voltage and current it equals cosine phi. We will reduce power factor while keeping both active power and source voltage unchanged.',
  'Current equals active power divided by voltage times power factor. With power factor one, current is five amperes. With power factor zero point five, current is ten amperes. Current has doubled. The active load still uses eleven hundred and fifty watts.',
  'Apparent power is voltage times current, measured in volt amperes. It also equals active power divided by power factor. Eleven hundred and fifty watts divided by zero point five gives two thousand three hundred volt amperes. Voltage times ten amperes gives the same result.',
  'For sinusoidal conditions, the power triangle relates active, reactive and apparent power. Reactive power describes energy exchanged with reactive components. Its magnitude is the square root of apparent power squared minus active power squared. Keep watts, vars and volt amperes distinct.',
  'In the guided laboratory, predict current at power factor one. Read and record it. Then predict current at power factor zero point five, with voltage and active power unchanged. Explain what changed and what remained constant. Pause here and try both cases.'
 ]};
