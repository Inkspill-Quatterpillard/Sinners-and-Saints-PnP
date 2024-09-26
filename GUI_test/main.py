from tkinter import *
from tkinter.ttk import *
from tkinter.filedialog import askopenfilename # Open file dialog

import json

# globals
json_char = {}

def openfile():
    filename = askopenfilename(parent=root)
    f = open(filename)
    global json_char
    json_char = json.load(f)
    f.close()

root = Tk()
menubar = Menu(root)
filemenu = Menu(menubar, tearoff=0)
filemenu.add_command(label="Open", command=openfile)
filemenu.add_separator()
filemenu.add_command(label="Exit", command=root.quit)
menubar.add_cascade(label="File", menu=filemenu)

root.config(menu=menubar)
root.mainloop()
window = Tk()

atrs = ["STR", "GES", "KLU", "CHA", "KON", "WAH", "INT", "WIL"]

frm_atr = Frame()

for atr in atrs:
    frm_lbl = Frame(master = frm_atr)
    frm_lbl.grid(row = atrs.index(atr), column = 0)
    lbl_atr = Label(master = frm_lbl, text = atr)
    lbl_atr.pack()

    var1 = StringVar()

    frm_dd = Frame(master = frm_atr)
    frm_dd.grid(row = atrs.index(atr), column = 1)
    dd_atr = OptionMenu(frm_dd,var1 , 10, *map(str, range(3, 19)))
    dd_atr.pack()

frm_atr.grid(row = 0, column = 0)

def run():
   resultlabel['text'] = f'You selected: {var1.get()}'

var1 = StringVar()

resultlabel = Label(window)

menu = OptionMenu(window, var1, "A", "B", "C")

generate = Button(window, text="Go", command=run)

menu.grid(row=1, column=2)

generate.grid(row=4, column=2, sticky=W)

resultlabel.grid(row=5, column=1)

window.mainloop()
