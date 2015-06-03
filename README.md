> **Note**: FuzzFace is the frontend, UI framework for the FuzzFinders app.

### Background
The goal of FuzzFinders is to create a global  community of  animal  lovers. This community will  crowd-solve the big problems  facing  pet owners  and advocates.  In  addition to  the app that  will  locate missing and found pets, FuzzFinders will  include a blog/feed section - the FuzzFeed. The FuzzFeed  will  feature photos  and videos  of adoptable pets  from  local shelters  and also  serve as  a great place for users to share pet content.

### APIs

Following a decoupled architectural framework, the goal is to separate application concerns and create discrete applications that will be updated asynchronously.

FuzzFace consumes the following backend applications:

1. [FuzzFinders-API] (https://github.com/jergagon1/fuzzfinders-api)

2. [FuzzFeed-API] (https://github.com/jergagon1/fuzzfeed-api)

3. [FuzzFriends-API] (https://github.com/jergagon1/fuzzfriends-api)

### Setup Instructions for FuzzFace

1.  `bundle install`
2.  `bundle exec shotgun`
3. Follow setup instructions for the backend APIs

### Contributing

We would love for you to help make FuzzFinders more awesome. To contribute, you can do the following:

1. Ask for a bug fix or enhancement!
2. Submit a pull request for a bug fix or enhancement!
3. Code review an open pull request!