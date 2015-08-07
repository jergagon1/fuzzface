# # route for testing s3 upload
# get "/s3_test" do
#   @page_title = "S3 Testing"
#   puts "S3 testing"
#   p @s3_direct_post = S3_BUCKET.presigned_post(key: "uploads/#{SecureRandom.uuid}/${filename}", success_action_status: 201, acl: :public_read)
#   puts "Testing dotENV:"
#   p ENV['AWS_SECRET_ACCESS_KEY']
#   puts "Test bucket:"
#   p AWS::S3.new.buckets[ENV['S3_BUCKET_NAME']]
# end