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
    packages=find_packages(include=['horseman', 'horseman.*']),
    package_data={'horseman.horsemanadmin': ['templates/**/*', 'frontend/**/*']},
    include_package_data=True,
    classifiers=[],
    license='MIT',
    platforms=['any'],
)
