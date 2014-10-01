# -*- coding: utf-8 -*-
require "nokogiri"
require "open-uri"
require "json"
require "parallel"

###クックパッドのレシピを取得するするスクリプト by keroxp

class GetRecepies
  def initialize
    @base_url = "http://cookpad.com"
    @errs = []
    @max_page= 10
    @path = File.expand_path(File.dirname(__FILE__)).to_s
  end
  def loadAll
    d = {}
    doc = Nokogiri::HTML(open(@base_url+"/category/list").read)
    doc.css("h2.sub_category_title a").each do |a|
      d[a.content] = a.attr("href")
      p d
    end
    open(@path+"/data/categories.json","w"){|j|
      j.write JSON.generate d
    }
  end
  def loadRecepies
    categories = JSON.parse(open(@path+"/data/categories.json").read)
    Parallel.each(categories, :in_processes => 5) do |category|
      data = []
      p category
      begin
        for i in 1..@max_page
          doc = Nokogiri::HTML(open(@base_url+category[1]+"?page="+i.to_s).read)
          doc.css(".recipe-preview").each do |r|
            recipe = {}
            r.css(".recipe-image").each do |ri|
                recipe["iamge_path"] = ri.css("img").first.attr("src")
                recipe["link"] = ri.css("a").first.attr("href")
            end
            recipe["title"] = r.css(".title a").first.content
            # p recipe
            data << recipe
          end
        end
        open(@path+"/data/"+category[0]+".json","w") do |j|
          j.write JSON.pretty_generate data
        end
      rescue => e
        @errs << e
        p e
      end
    end
  end

  def merge_jsons
    data = {}
    Dir.glob(@path+"/data/*.json") do |json|
      unless /categories/ =~ json
        fn =File.basename(json).gsub(".json","")
        p fn
        begin
          obj = JSON.parse open(json).read
          data[fn] = obj
        rescue

        ensure
        end
      end
    end
    open(@path+"/allrecipe.json","w") do |f|
      f.write JSON.generate data
    end
  end
end

gr = GetRecepies.new
gr.loadAll

# gr.loadRecepies
# gr.merge_jsons
