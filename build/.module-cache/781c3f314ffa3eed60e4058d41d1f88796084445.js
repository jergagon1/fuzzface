var SignInPageContainer = React.createClass({displayName: "SignInPageContainer",
	render: function() {
		return (
			React.createElement("div", {class: "container"}, 
			"container"
			)
		);
	}
});



var HelloWorld = React.createClass({displayName: "HelloWorld",
    render: function() {
        return React.createElement("div", null, "Hello, world!");
    }
});

React.render(
	React.createElement(HelloWorld, null),
	 document.body
	);

