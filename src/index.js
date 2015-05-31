var SignInPageContainer = React.createClass({
	render: function() {
		return (
			<div className='container'>
				<SignInPageNav />
				<SignInPageTitle />
			</div>
		);
	}
});

var SignInPageNav = React.createClass({
	render: function() {
		return (
			<div className='nav-container'>
				<div className='logo-container'>
					<img className='logo-img' src='images/FuzzFinders_Logo_small.png'></img>
				</div>
				<div className='nav-list-container'>
					<ul className='nav-list'>
						<li><a href='#'>About</a></li>
						<li><a href='#'>FAQ</a></li>
						<li><a href='#'>Contact</a></li>
					</ul>
				</div>
				
			</div>
		);
	}
});

var SignInPageTitle = React.createClass({
	render: function() {
		return (
		<div>	
			<div className='title-container'>
				<img className='index-dog-img' src='images/dog-title.jpg'></img>
			</div>


				<div className='sign-in-form-container'>
				<form className="signIn" role="form">
					<p>Sign In</p>
				  <div className="form-group">
				    <label for="email">Your Email:</label>
				    <input type="email" className="form-control" id="email" name="email"></input>
				  </div>
				  <div className="form-group">
				    <label for="pwd">Password :</label>
				    <input type="password" className="form-control" id="pwd" name="password"></input>
				  </div>
				  <div className="checkbox">
				    <label><input type="checkbox"></input>Remember me</label>
				  </div>
				  <button type="submit" className="btn btn-default">Submit</button>
				  <p>
						<a href="#" className="sign-form-swap">Sign Up</a>
					</p>
				</form>
				<form className="signUp">
					<p>Sign Up</p>
					<div className="form-group">
						<label for="username">Enter a Username:</label>
						<input type="text" className="form-control" name="username"></input>
					</div>
				  <div className="form-group">
				    <label for="email">Your Email:</label>
				    <input type="email" className="form-control" id="email" name="email"></input>
				  </div>
				  <div className="form-group">
				    <label for="pwd">Password :</label>
				    <input type="password" className="form-control" id="pwd" name="password"></input>
				  </div>
				  <div className="form-group">
				  	<label for="zip">Enter your Zip Code:</label>
				  	<input type="text" className="form-control" name="zip"></input>
				  </div>
				  <div className="checkbox">
				    <label><input type="checkbox"></input>Remember me</label>
				  </div>
				  <button type="submit" className="btn btn-default">Submit</button>
				  <p>
						<a href="#" className="sign-form-swap">Sign In</a>
					</p>
				</form>
			</div>
		</div>
		);
	}
});




// React.render(
// 	<SignInPageNav />,
// 	 document.body
// );

React.render(
	<SignInPageContainer />,
	 document.body
);

