class Report
  def self.find_by_slug(slug)
    HTTParty.get(
      "#{ENV['SERVER_URL']}/api/v1/reports/#{slug}",
      format: :json
    )
  end
end
