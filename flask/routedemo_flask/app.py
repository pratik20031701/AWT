from flask import Flask, render_template


app = Flask(__name__)


@app.route("/")
def home():
    return render_template(
        "home.html",
        page_title="Home",
        heading="Welcome to the Flask Routing Demo",
    )


@app.route("/about")
def about():
    return render_template(
        "about.html",
        page_title="About",
        heading="About This Demo",
    )


@app.route("/services")
def services():
    return render_template(
        "services.html",
        page_title="Services",
        heading="Services Page",
    )


@app.route("/contact")
def contact():
    return render_template(
        "contact.html",
        page_title="Contact",
        heading="Contact Us",
    )


@app.route("/user/<username>")
def user_profile(username):
    return render_template(
        "user.html",
        page_title="User Profile",
        heading=f"Hello, {username.title()}!",
        username=username,
    )


if __name__ == "__main__":
    app.run(debug=True)
