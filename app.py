from flask import Flask
from flask import request
from flask import redirect
from flask import render_template


app = Flask(__name__)


@app.route("/")
@app.route("/web")
@app.route("/web/")
def redirectToHome():
    print("hola")
    return redirect("/web/home")


@app.route("/web/<page>")
@app.route("/web/<section>/<page>")
def getPage(section=None, page=None):
    basePath = ""

    if section != None:
        basePath += section + "/"

    basePath += "/" + page

    includes = basePath + "/includes.html"
    content = basePath + "/content.html"

    title = ""

    if section != None:
        title += section.title() + " - "

    title += page.title()

    return render_template("main.html", includes=includes, content=content, title=title)


if __name__ == "__main__":
    app.run()
