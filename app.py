from flask import Flask, render_template

app = Flask(__name__)

@app.route('/breakout')
def breakout():
    return render_template('index.html')
