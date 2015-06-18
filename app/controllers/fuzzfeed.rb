get "/fuzzfeed" do
  # sessions
  # if not logged in
  #   redirect to sign up / login
  # else
  #   retrieve @articles json
  #   render fuzzfeed page template
  @page_title = "FuzzFeed"
  erb :fuzzfeed

end