from setuptools import setup, find_packages

setup(
    name="ecodrone-shared",
    version="0.1.0",
    description="Shared API contracts and constants for EcoDrone system",
    author="EcoDrone Team",
    packages=find_packages(),
    install_requires=[
        "pydantic>=2.0.0",
    ],
    python_requires=">=3.8",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
)
