# encoding:utf-8
import json
import os
import sys

fp = open('allrecipe.json','rb')
data = json.load(fp)

ft = open('allrecipe.ltsv','wb')
ft.write('title:料理\n') # カレント

for key in data:
    ft.write(' title:'+key.encode('utf-8')+'\n') # カテゴリ
    for key2 in data[key]:
        title = key2['title'].encode('utf-8')           # title
        url = key2['link'].encode('utf-8')              # url
        image_path = key2['iamge_path'].encode('utf-8') # image_path

        # \s \n \t を洗い出す
        # \s を - に置換
        title = title.replace('\n','')

        # ファイルに書き込み
        ft.write('  title:'+title+'\turl:'+url+'\text:html\timage_path:'+image_path+'\n')
