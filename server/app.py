# from flask import Flask
# from flask import jsonify
# from flask_cors import CORS
# from flask import render_template #To render html files

# app = Flask(__name__,template_folder='../client/public', static_folder='../client/public')
# CORS(app)
# @app.route('/')
# def root():
#     return render_template("index.html")

# #main driver
# if __name__ == '__main__':
#     app.run(debug=True, threaded=True)

# @app.route('/api/data', methods=['GET'])
# def get_data():
#     data = {"message": "Hello from the Flask API!"}
#     return jsonify(data)



from flask import Flask, jsonify, render_template
from flask_cors import CORS
from flask import request
import chess
import chess.engine

engine = chess.engine.SimpleEngine.popen_uci(r"../engine/stockfish-windows-x86-64-modern.exe")

app = Flask(__name__, template_folder='../client/public', static_folder='../client/public')
CORS(app) 



@app.route('/api/data', methods=['GET'])
def get_data():
    data = {"message": "Hello from the Flask API!(Flask Backend is functioning!)"}
    return jsonify(data)


@app.route('/')
def root():
    return render_template("index.html")


@app.route('/make_move',methods=["POST"])
def make_move():
    print("Received a POST request to /make_move")
    # print('request from',request.form)
    fen = request.form.get('fen')
    # print('fen:',fen)
    board = chess.Board(fen)
    # print(board)
    result = engine.play(board,chess.engine.Limit(time=0.1))
    board.push(result.move)
    fen=board.fen()
    return {'fen': fen,'best_move': str(result.move)}


if __name__ == '__main__':
    app.run(debug=True, threaded=True)
