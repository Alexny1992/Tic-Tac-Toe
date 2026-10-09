import random

def drawBoard(board):
    print('' + board[0] + ' | ' + board[1] + ' | ' + board[2])
    print('----------')
    print('' + board[3] + ' | ' + board[4] + ' | ' + board[5])
    print('----------')
    print('' + board[6] + ' | ' + board[7] + ' | ' + board[8])


def checkWinning(board, player_input):
    return ((board[0] == player_input and board[1] == player_input and board[2] == player_input) or
    (board[3] == player_input and board[4] == player_input and board[5] == player_input) or
    (board[6] == player_input and board[7] == player_input and board[8] == player_input) or
    (board[0] == player_input and board[3] == player_input and board[6] == player_input) or
    (board[1] == player_input and board[4] == player_input and board[7] == player_input) or
    (board[2] == player_input and board[5] == player_input and board[8] == player_input) or
    (board[0] == player_input and board[4] == player_input and board[8] == player_input) or
    (board[2] == player_input and board[4] == player_input and board[6] == player_input))

def playerInput():
    while True:
        player_input = ' '
        player_input = str(input("Would you like to start as X or O?: "))
        if player_input.upper() in ('X', 'O'):
            break

    if player_input =='X':
        return ('X','O')
    else:
        return ('O','X')

def inputPosition():
    while True:
        position = 0
        position = input("Please enter a position from 1-9: ")
        if position in ('1','2','3','4','5','6','7','8','9'):
            return position
            break

def boardUpdate(board, position, player_input):
        board[position - 1] = player_input
        drawBoard(board)

def restartGame():
    pass

def randomStart():
    ran = random.randint(0,1)
    if ran == 1:
        return 'Player_1'
        print("Player 1 will go first")
    else:
        return 'Player_2'
        print("Player 2 will go first")




board =[' ']*9
Player_1, Player_2 = playerInput()
print(Player_1, Player_2)
turn = randomStart()
game = True
while game:
    if turn == "Player_1":
        position = int(inputPosition())
        boardUpdate(board, position, Player_1)
        if checkWinning(board, Player_1):
            print("Congrats Player 1 have own the game!")
            game = False
        turn = 'Player_2'
    else:
        if turn == "Player_2":
            position = int(inputPosition())
            boardUpdate(board, position, Player_2)
            if checkWinning(board, Player_2):
                print("Congrat Player 2 has won the game!")
        turn = "Player_1"

