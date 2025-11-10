# Write your code here...
from machine import Pin, PWM
servo = PWM(Pin(15), freq=50)
servo.duty(77)
