---
title: Secure Coding Specifications
---

This article is a checklist. When you write code, you need to check whether the new code violates the following items.

1. It is prohibited to have authentication credentials that cannot be modified (e.g., hard-coded passwords in process binaries).
2. If implemented using interpreted languages (such as Shell/Python/Perl scripts, JSP, HTML, etc.), for functions that do not meet the requirement of undisclosed interfaces and need to be cleaned up, they must be completely deleted. It is strictly prohibited to use forms such as comment lines to merely disable the functions.
3. It is prohibited to use private cryptographic algorithms for encryption and decryption, including:
    - Cryptographic algorithms designed independently without being evaluated by professional institutions;
    - Self-defined data conversion algorithms executed through methods such as deformation/character shifting/replacement;
    - Pseudo-encryption implementations that use encoding methods (such as Base64 encoding) to achieve the purpose of data encryption.
    Note: In scenarios other than encryption and decryption, the use of encoding methods such as Base64 or algorithms such as deformation/shifting/replacement for legitimate business purposes does not violate this provision.
4. The random numbers used in cryptographic algorithms must be secure random numbers in the cryptographic sense.
5. It is prohibited to print authentication credentials (passwords/private keys/pre-shared keys) in plain text in system-stored logs, debugging information, and error prompts.
