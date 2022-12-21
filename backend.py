import youtube_dl as ydl
import os
import sys
import json
import time


class Downloader(object):

    @staticmethod
    def get_metadata(url):
        # get the metadata for the url, it can be any url, not just youtube
        # identify if the media is a video or audio
        # return the metadata as a json object
        # the metadata should include the title, thumbnail, duration, and the url
        # the url should be the url of the video or audio
        

        # check if is youtube URL, .be or .com
        if 'youtube.com' in url or 'youtu.be' in url:
            try:
                # get the video id
                video_id = url.split('v=')[-1]
                # get the metadata with youtube dl
                with ydl.YoutubeDL({'quiet': True}) as yt:
                    metadata = yt.extract_info(url, download=False)
                # get the title, thumbnail, duration, and the url
                title = metadata['title']
                thumbnail = metadata['thumbnail']
                duration = metadata['duration']
                metadata['provider'] = 'youtube'
                url = 'https://www.youtube.com/watch?v=' + video_id
                raw = metadata
                # return the metadata as a json object
                return json.dumps({'title': title, 'thumbnail': thumbnail, 'duration': duration, 'url': url, "provider": metadata['provider'], 'raw': raw})
            except Exception as e:
                return json.dumps({'error': str(e)})