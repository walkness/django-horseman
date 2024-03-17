from setuptools import setup, find_packages

long_description = open('README.rst').read()

setup(
    name='django-horseman',
    version='0.1',
    description='A simple headless CMS for Django',
    long_description=long_description,
    author='Walker Angell',
    author_email='w@lker.co',
    url='https://github.com/walkness/django-horseman',
    packages=[
        'horseman',
        'horseman.horsemanadmin',
        'horseman.horsemanapi',
        'horseman.horsemancomments',
        'horseman.horsemanfrontendcache',
        'horseman.horsemanimages',
        'horseman.horsemannodes',
        'horseman.horsemanoptions',
        'horseman.horsemanusers',
    ],
    classifiers=[],
    license='MIT',
    platforms=['any'],
)
