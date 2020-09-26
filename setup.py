from setuptools import setup, find_namespace_packages

long_description = open('README.rst').read()

setup(
    name='django-horseman',
    version='0.1',
    description='A simple headless CMS for Django',
    long_description=long_description,
    author='Walker Angell',
    author_email='w@lker.co',
    url='http://github.com/sunlightlabs/django-wordpress/',
    packages=find_namespace_packages(where='horseman'),
    classifiers=[],
    license='MIT',
    platforms=['any'],
)
